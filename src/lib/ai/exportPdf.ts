import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ParsedLogEntry, FinancialSummary } from '../../types/aiProcessLog';
import { registerRoboto } from '../fonts/registerRoboto';

export interface PdfLabels {
  reportTitle: string;
  generatedOn: string;
  machinesLabel: string;
  totalCost: string;
  profitLeak: string;
  analystTitle: string;
  actionPlanTitle: string;
  sheetEvents: string;
  gdprFooter: string;
  columns: {
    machine: string;
    type: string;
    start: string;
    end: string;
    durationH: string;
    cost: string;
    profitLeak: string;
    notes: string;
  };
  eventTypes: Record<string, string>;
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

function durationLabel(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours % 1) * 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function addGdprFooters(doc: jsPDF, gdprText: string) {
  const pages = doc.getNumberOfPages();
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const GREEN: [number, number, number] = [22, 163, 74];
  const GRAY: [number, number, number] = [156, 163, 175];

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(14, H - 12, W - 14, H - 12);
    doc.setFillColor(...GREEN);
    doc.circle(18, H - 7.5, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('Roboto', 'bold');
    doc.text('V', 18, H - 6.5, { align: 'center' });
    doc.setTextColor(...GREEN);
    doc.setFontSize(7);
    doc.setFont('Roboto', 'bold');
    doc.text(gdprText, 23, H - 6.5);
    doc.setTextColor(...GRAY);
    doc.setFont('Roboto', 'normal');
    doc.text(`${i} / ${pages}`, W - 14, H - 6.5, { align: 'right' });
  }
}

export function exportToPdf(
  data: ParsedLogEntry[],
  summary: FinancialSummary,
  analystConclusion: string | undefined,
  actionPlan: string[] | undefined,
  labels: PdfLabels
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const BLUE: [number, number, number] = [37, 99, 235];
  const GRAY: [number, number, number] = [107, 114, 128];
  const DARK: [number, number, number] = [17, 24, 39];
  const RED: [number, number, number] = [220, 38, 38];
  const GREEN: [number, number, number] = [22, 163, 74];

  registerRoboto(doc);

  doc.setFillColor(...BLUE);
  doc.roundedRect(14, 12, 32, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('Roboto', 'bold');
  doc.text('MECHANICPRO', 30, 19.5, { align: 'center' });

  doc.setTextColor(...DARK);
  doc.setFontSize(17);
  doc.setFont('Roboto', 'bold');
  doc.text(labels.reportTitle, 52, 19);

  const auditDate = new Date().toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont('Roboto', 'normal');
  doc.text(`${labels.generatedOn}: ${auditDate}`, 52, 25);

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.4);
  doc.line(14, 31, W - 14, 31);

  const machineIds = [...new Set(data.map((e) => e.machineId))];
  const MACHINES_Y = 35;

  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.text(`${labels.machinesLabel}:`, 14, MACHINES_Y + 3);

  let chipX = 14 + doc.getTextWidth(`${labels.machinesLabel}: `) + 2;
  machineIds.forEach((id) => {
    const chipW = doc.getTextWidth(id) + 6;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(chipX, MACHINES_Y - 0.5, chipW, 5, 1, 1, 'FD');
    doc.setTextColor(...BLUE);
    doc.setFontSize(7.5);
    doc.setFont('Roboto', 'bold');
    doc.text(id, chipX + 3, MACHINES_Y + 3);
    chipX += chipW + 3;
  });

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(14, MACHINES_Y + 8, W - 14, MACHINES_Y + 8);

  const BOX_Y = MACHINES_Y + 13;
  const BOX_H = 22;
  const BOX_W = (W - 28 - 4) / 2;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(14, BOX_Y, BOX_W, BOX_H, 2, 2, 'FD');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.text(labels.totalCost.toUpperCase(), 19, BOX_Y + 7);
  doc.setTextColor(...DARK);
  doc.setFontSize(15);
  doc.setFont('Roboto', 'bold');
  doc.text(`€${summary.totalCost.toFixed(2)}`, 19, BOX_Y + 17);

  const hasLeak = summary.totalProfitLeak > 0;
  doc.setFillColor(
    ...(hasLeak ? ([254, 242, 242] as [number, number, number]) : ([248, 250, 252] as [number, number, number]))
  );
  doc.setDrawColor(
    ...(hasLeak ? ([254, 202, 202] as [number, number, number]) : ([229, 231, 235] as [number, number, number]))
  );
  doc.roundedRect(14 + BOX_W + 4, BOX_Y, BOX_W, BOX_H, 2, 2, 'FD');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.setFont('Roboto', 'normal');
  doc.text(labels.profitLeak.toUpperCase(), 19 + BOX_W + 4, BOX_Y + 7);
  doc.setTextColor(...(hasLeak ? RED : GREEN));
  doc.setFontSize(15);
  doc.setFont('Roboto', 'bold');
  doc.text(
    hasLeak ? `€${summary.totalProfitLeak.toFixed(2)}` : '€0.00',
    19 + BOX_W + 4,
    BOX_Y + 17
  );

  autoTable(doc, {
    startY: BOX_Y + BOX_H + 8,
    head: [
      [
        labels.columns.machine,
        labels.columns.type,
        labels.columns.start,
        labels.columns.end,
        labels.columns.durationH,
        labels.columns.cost,
        labels.columns.profitLeak,
        labels.columns.notes,
      ],
    ],
    body: data.map((e) => [
      e.machineId,
      labels.eventTypes[e.type] ?? e.type,
      fmtDate(e.startTime),
      fmtDate(e.endTime),
      durationLabel(e.financials.durationHours),
      `€${e.financials.totalCost.toFixed(2)}`,
      e.financials.profitLeak > 0 ? `€${e.financials.profitLeak.toFixed(2)}` : '-',
      e.notes ?? '',
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'Roboto',
    },
    headStyles: {
      fillColor: BLUE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      font: 'Roboto',
    },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 6) {
        const val = hookData.cell.raw as string;
        if (val && val !== '-') {
          hookData.cell.styles.textColor = RED;
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { cellWidth: 30, fontSize: 7.5 },
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sectionBottom = (doc as any).lastAutoTable.finalY as number;

  if (analystConclusion) {
    const CY = sectionBottom + 10;
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.roundedRect(14, CY, W - 28, 7, 2, 2, 'FD');
    doc.setTextColor(...BLUE);
    doc.setFontSize(8);
    doc.setFont('Roboto', 'bold');
    doc.text(`AI  ${labels.analystTitle.toUpperCase()}`, 19, CY + 5);
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(8.5);
    doc.setFont('Roboto', 'normal');
    const lines = doc.splitTextToSize(analystConclusion, W - 32);
    doc.text(lines, 14, CY + 13);
    sectionBottom = CY + 13 + lines.length * 5;
  }

  if (actionPlan && actionPlan.length > 0) {
    const AP_Y = sectionBottom + 10;
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(221, 214, 254);
    doc.roundedRect(14, AP_Y, W - 28, 7, 2, 2, 'FD');
    doc.setTextColor(109, 40, 217);
    doc.setFontSize(8);
    doc.setFont('Roboto', 'bold');
    doc.text(`+ ${labels.actionPlanTitle.toUpperCase()}`, 19, AP_Y + 5);
    let itemY = AP_Y + 14;
    actionPlan.forEach((item, i) => {
      doc.setFillColor(109, 40, 217);
      doc.circle(18, itemY - 1.5, 3.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('Roboto', 'bold');
      doc.text(String(i + 1), 18, itemY - 0.5, { align: 'center' });
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(8.5);
      doc.setFont('Roboto', 'normal');
      const itemLines = doc.splitTextToSize(item, W - 42);
      doc.text(itemLines, 24, itemY);
      itemY += itemLines.length * 5 + 4;
    });
  }

  addGdprFooters(doc, labels.gdprFooter);
  doc.save(`audit-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
