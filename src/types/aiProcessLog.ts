export type LogEventType = 'setup' | 'work' | 'downtime' | 'failure';

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

export interface SpotPriceInfo {
  price: number;
  priceMWh: number;
  hourLabel: string;
  isFallback: boolean;
  fetchedAt: string;
}

export type PiiCategory =
  | 'email'
  | 'phone'
  | 'personal_id'
  | 'company_id'
  | 'ip'
  | 'address'
  | 'name';

export interface ProcessResult {
  success: boolean;
  data?: ParsedLogEntry[];
  savedIds?: string[];
  financialSummary?: FinancialSummary;
  analystConclusion?: string;
  actionPlan?: string[];
  spotPrice?: SpotPriceInfo;
  gdpr?: {
    redactedCount: number;
    redactedTypes: Partial<Record<PiiCategory, number>>;
  };
  error?: string;
  rawResponse?: string;
}
