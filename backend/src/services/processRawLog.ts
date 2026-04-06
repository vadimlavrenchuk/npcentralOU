import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductionLog, LogEventType } from '../models/ProductionLog';
import { Machine, IMachine } from '../models/Machine';
import { TARIFFS, COST_PER_HOUR } from '../lib/financialConstants';
import { getSpotPriceEE, SpotPriceInfo } from '../lib/energyApi';
import { anonymizeText, AnonymizeResult } from '../lib/anonymize';

/** @see https://ai.google.dev/gemini-api/docs/models/gemini — 1.5-* IDs return 404 on current API */
function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
}

function getGeminiClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(key);
}

function geminiResponseText(response: { text: () => string }): string {
  try {
    return response.text();
  } catch {
    return '';
  }
}

export interface EventFinancials {
  durationHours: number;
  laborCost: number;
  energyCost: number;
  airCost: number;
  totalCost: number;
  profitLeak: number;
}

export interface ParsedLogEntry {
  machineId: string;
  type: LogEventType;
  startTime: string;
  endTime: string;
  energyConsumed: number;
  airConsumed: number;
  toolWear: number;
  notes?: string;
  financials: EventFinancials;
}

export interface FinancialSummary {
  totalCost: number;
  totalProfitLeak: number;
}

export interface ProcessResult {
  success: boolean;
  data?: ParsedLogEntry[];
  savedIds?: string[];
  financialSummary?: FinancialSummary;
  analystConclusion?: string;
  actionPlan?: string[];
  spotPrice?: SpotPriceInfo;
  gdpr?: Pick<AnonymizeResult, 'redactedCount' | 'redactedTypes'>;
  error?: string;
  rawResponse?: string;
}

const PARSE_SYSTEM_PROMPT = `You are an industrial production log analyst.
Your task is to parse unstructured log text and extract production events as structured JSON.

Rules:
- Return ONLY a valid JSON array of events. No markdown, no explanations, no code fences.
- Each event must have exactly these fields:
  - machineId: string — equipment/machine identifier. Use "UNKNOWN" if not found.
  - type: "setup" | "work" | "downtime" | "failure"
      • "setup"    → наладка, настройка, переналадка, changeover
      • "work"     → работа, производство, выпуск, running, production
      • "downtime" → простой, ожидание, техобслуживание, maintenance, idle
      • "failure"  → авария, поломка, неисправность, сбой, breakdown, fault
  - startTime: ISO 8601 string (e.g. "2024-03-01T08:00:00")
  - endTime: ISO 8601 string
  - energyConsumed: number in kWh. Estimate from duration if not stated. Use 0 if unclear.
  - airConsumed: number in m³. Estimate from duration if not stated. Use 0 if unclear.
  - toolWear: number 0–100 (percent). Estimate if not stated. Use 0 if unclear.
  - notes: string with any relevant context. Omit if nothing noteworthy.
- If the log has multiple events, return all of them.
- If a date is missing the year, assume the current year.`;

const LOCALE_LANGUAGE: Record<string, string> = {
  en: 'English',
  et: 'Estonian',
  ru: 'Russian',
  fi: 'English',
};

function buildAnalystPrompt(
  events: ParsedLogEntry[],
  summary: FinancialSummary,
  spotPrice: SpotPriceInfo,
  locale: string
): string {
  const language = LOCALE_LANGUAGE[locale] ?? 'English';
  const eventLines = events
    .map((e, i) => {
      const f = e.financials;
      return [
        `Event ${i + 1}: [${e.type.toUpperCase()}] Machine=${e.machineId}`,
        `  Duration: ${f.durationHours.toFixed(2)}h`,
        `  Cost: €${f.totalCost.toFixed(2)} (labor €${f.laborCost.toFixed(2)}, energy €${f.energyCost.toFixed(2)}, air €${f.airCost.toFixed(2)})`,
        f.profitLeak > 0 ? `  ⚠ Profit Leak: €${f.profitLeak.toFixed(2)} (excess setup time)` : '',
        e.notes ? `  Notes: ${e.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const energyNote = spotPrice.isFallback
    ? `Energy price used: €${spotPrice.price.toFixed(4)}/kWh (fallback, Nord Pool EE API unavailable)`
    : `Energy price used: €${spotPrice.price.toFixed(4)}/kWh (live Nord Pool EE spot price)`;

  return `You are a manufacturing cost optimization expert.
Analyze the following production data and return a JSON object with exactly two fields:

{
  "conclusion": "<3-5 sentence expert summary. Mention the machine ID, key anomaly, cost impact, and potential savings per month. End the conclusion with: 'This analysis uses the current Nord Pool EE spot electricity price (${spotPrice.price.toFixed(4)} €/kWh).'>",
  "actionPlan": [
    "<Concrete action #1 for the engineer — specific, measurable, with time or number>",
    "<Concrete action #2 for the engineer — specific, measurable, with time or number>",
    "<Concrete action #3 for the engineer — specific, measurable, with time or number>"
  ]
}

Rules:
- Return ONLY valid JSON. No markdown, no code fences, no extra text.
- BOTH fields MUST be written in ${language}. This is critical — do not use any other language.
- actionPlan items must be short imperative sentences (max 20 words each).
- Be specific: use actual machine IDs, durations and euro amounts from the data.
- The last sentence of "conclusion" must mention the Nord Pool EE spot price in ${language}.

--- FINANCIAL DATA ---
Total session cost: €${summary.totalCost.toFixed(2)}
Total profit leak: €${summary.totalProfitLeak.toFixed(2)}
${energyNote}

${eventLines}
--- END DATA ---

Return the JSON object now:`;
}

function calculateFinancials(
  entry: Omit<ParsedLogEntry, 'financials'>,
  machine: IMachine | null,
  energyRateKWh: number
): EventFinancials {
  const durationHours =
    (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 3_600_000;

  const laborCost = durationHours * COST_PER_HOUR;
  const energyCost = entry.energyConsumed * energyRateKWh;
  const airCost = entry.airConsumed * TARIFFS.AIR_M3;
  const totalCost = laborCost + energyCost + airCost;

  let profitLeak = 0;
  if (entry.type === 'setup' && machine?.setupStandardTime != null) {
    const overDuration = Math.max(0, durationHours - machine.setupStandardTime);
    profitLeak = overDuration * COST_PER_HOUR;
  }

  return {
    durationHours: Math.max(0, durationHours),
    laborCost,
    energyCost,
    airCost,
    totalCost,
    profitLeak,
  };
}

async function ensureMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(uri);
}

export async function processRawLog(rawText: string, locale = 'en'): Promise<ProcessResult> {
  if (!rawText.trim()) {
    return { success: false, error: 'Log text cannot be empty.' };
  }

  let rawResponse = '';

  try {
    const { text: safeText, redactedCount, redactedTypes } = anonymizeText(rawText);
    const gdpr = { redactedCount, redactedTypes };

    const genAI = getGeminiClient();
    const parseModel = genAI.getGenerativeModel({
      model: getGeminiModel(),
      systemInstruction: PARSE_SYSTEM_PROMPT,
    });

    const [spotPrice, parseResult] = await Promise.all([
      getSpotPriceEE(),
      parseModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Parse this production log:\n\n${safeText}` }] }],
        generationConfig: { maxOutputTokens: 4096 },
      }),
    ]);

    rawResponse = geminiResponseText(parseResult.response);

    const cleaned = rawResponse
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let rawParsed: Omit<ParsedLogEntry, 'financials'>[];
    try {
      const value = JSON.parse(cleaned) as unknown;
      rawParsed = Array.isArray(value) ? (value as Omit<ParsedLogEntry, 'financials'>[]) : [value as Omit<ParsedLogEntry, 'financials'>];
    } catch {
      return { success: false, error: 'Model returned invalid JSON.', rawResponse };
    }

    await ensureMongo();
    const machineIds = [...new Set(rawParsed.map((e) => e.machineId))];
    const machines = await Machine.find({ machineId: { $in: machineIds } });
    const machineMap = new Map(machines.map((m) => [m.machineId, m]));

    const enriched: ParsedLogEntry[] = rawParsed.map((entry) => ({
      ...entry,
      financials: calculateFinancials(
        entry,
        machineMap.get(entry.machineId) ?? null,
        spotPrice.price
      ),
    }));

    const financialSummary: FinancialSummary = {
      totalCost: enriched.reduce((s, e) => s + e.financials.totalCost, 0),
      totalProfitLeak: enriched.reduce((s, e) => s + e.financials.profitLeak, 0),
    };

    const docs = await ProductionLog.insertMany(
      enriched.map((entry) => ({
        machineId: entry.machineId,
        type: entry.type,
        startTime: new Date(entry.startTime),
        endTime: new Date(entry.endTime),
        energyConsumed: entry.energyConsumed ?? 0,
        airConsumed: entry.airConsumed ?? 0,
        toolWear: entry.toolWear ?? 0,
        notes: entry.notes,
        cost: entry.financials.totalCost,
        profitLeak: entry.financials.profitLeak,
      }))
    );

    let analystConclusion: string | undefined;
    let actionPlan: string[] | undefined;
    try {
      const analystModel = genAI.getGenerativeModel({ model: getGeminiModel() });
      const analystResult = await analystModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildAnalystPrompt(enriched, financialSummary, spotPrice, locale) }],
          },
        ],
        generationConfig: { maxOutputTokens: 1024 },
      });
      const raw = geminiResponseText(analystResult.response).trim();

      const analystCleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(analystCleaned) as { conclusion?: unknown; actionPlan?: unknown };
      analystConclusion = typeof parsed.conclusion === 'string' ? parsed.conclusion : undefined;
      actionPlan = Array.isArray(parsed.actionPlan)
        ? (parsed.actionPlan as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 3)
        : undefined;
    } catch {
      // optional analyst step
    }

    return {
      success: true,
      data: enriched,
      savedIds: docs.map((d) => String(d._id)),
      financialSummary,
      analystConclusion,
      actionPlan,
      spotPrice,
      gdpr,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error.';
    return { success: false, error: msg, rawResponse: rawResponse || undefined };
  }
}
