import * as XLSX from 'xlsx';
import type { ParsedLogEntry, FinancialSummary } from '../../types/aiProcessLog';

export interface ExcelLabels {
  sheetEvents: string;
  sheetSummary: string;
  totalCost: string;
  profitLeak: string;
  gdprNote: string;
  generatedOn: string;
  eventTypes: Record<string, string>;
  columns: {
    machine: string;
    type: string;
    start: string;
    end: string;
    durationH: string;
    energy: string;
    air: string;
    wear: string;
    cost: string;
    laborCost: string;
    energyCost: string;
    airCost: string;
    profitLeak: string;
    notes: string;
  };
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function exportToExcel(data: ParsedLogEntry[], summary: FinancialSummary, labels: ExcelLabels) {
  const wb = XLSX.utils.book_new();
  const c = labels.columns;

  const sorted = [...data].sort((a, b) => b.financials.profitLeak - a.financials.profitLeak);

  const eventsRows = sorted.map((e) => ({
    [c.machine]: e.machineId,
    [c.type]: labels.eventTypes[e.type] ?? e.type,
    [c.start]: fmtDate(e.startTime),
    [c.end]: fmtDate(e.endTime),
    [c.durationH]: parseFloat(e.financials.durationHours.toFixed(3)),
    [c.energy]: e.energyConsumed,
    [c.air]: e.airConsumed,
    [c.wear]: e.toolWear,
    [c.cost]: parseFloat(e.financials.totalCost.toFixed(2)),
    [c.laborCost]: parseFloat(e.financials.laborCost.toFixed(2)),
    [c.energyCost]: parseFloat(e.financials.energyCost.toFixed(2)),
    [c.airCost]: parseFloat(e.financials.airCost.toFixed(2)),
    [c.profitLeak]: parseFloat(e.financials.profitLeak.toFixed(2)),
    [c.notes]: e.notes ?? '',
  }));

  const ws1 = XLSX.utils.json_to_sheet(eventsRows);
  const colKeys = Object.keys(eventsRows[0] ?? {});
  ws1['!cols'] = colKeys.map((key) => {
    const maxData = sorted.reduce((max, e, idx) => {
      const row = eventsRows[idx] as Record<string, unknown>;
      const val = String(row[key] ?? '');
      return Math.max(max, val.length);
    }, 0);
    return { wch: Math.max(key.length + 2, maxData + 2, 10) };
  });

  const lastCol = XLSX.utils.encode_col(colKeys.length - 1);
  ws1['!autofilter'] = { ref: `A1:${lastCol}1` };
  ws1['!freeze'] = { xSplit: 0, ySplit: 1 };

  XLSX.utils.book_append_sheet(wb, ws1, labels.sheetEvents);

  const summaryRows: Array<Record<string, string | number>> = [
    { Metric: labels.totalCost, Value: parseFloat(summary.totalCost.toFixed(2)), Unit: '€' },
    { Metric: labels.profitLeak, Value: parseFloat(summary.totalProfitLeak.toFixed(2)), Unit: '€' },
  ];
  summaryRows.push({ Metric: '', Value: '', Unit: '' });
  summaryRows.push({
    Metric: labels.gdprNote,
    Value: `${labels.generatedOn}: ${new Date().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
    Unit: '',
  });

  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 36 }, { wch: 14 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws2, labels.sheetSummary);

  XLSX.writeFile(wb, `audit-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
