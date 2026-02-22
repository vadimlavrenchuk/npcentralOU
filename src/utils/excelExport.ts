/**
 * Excel Export Utility - Export data to XLSX format
 */

import * as XLSX from 'xlsx';

/**
 * Export data array to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export const exportToExcel = (data: any[], filename: string): void => {
  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Auto-size columns
  const maxWidth = 50;
  const cols = Object.keys(data[0] || {}).map(key => {
    const maxLength = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  worksheet['!cols'] = cols;

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
};

/**
 * Export multiple sheets to Excel file
 * @param sheets - Array of {name, data} objects
 * @param filename - Name of the file to download
 */
export const exportMultipleSheetsToExcel = (
  sheets: Array<{ name: string; data: any[] }>,
  filename: string
): void => {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);
    
    // Auto-size columns
    const maxWidth = 50;
    const cols = Object.keys(sheet.data[0] || {}).map(key => {
      const maxLength = Math.max(
        key.length,
        ...sheet.data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = cols;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
};

/**
 * Export monthly report to Excel with custom formatting
 * @param data - Report data
 * @param month - Month name
 * @param year - Year
 */
export const exportMonthlyReportToExcel = (
  data: any[], 
  month: string,
  year: string | number
): void => {
  const filename = `monthly_report_${month}_${year}.xlsx`;
  
  // Format data with user-friendly headers
  const formattedData = data.map(row => ({
    'Order Number': row.orderNumber || '',
    'Title': row.title || '',
    'Equipment': row.equipment || '',
    'Status': row.status || '',
    'Priority': row.priority || '',
    'Assigned To': row.assignedTo || '',
    'Created Date': row.createdAt || '',
    'Completed Date': row.completedAt || '',
    'Due Date': row.dueDate || '',
    'Parts Used': row.partsUsed || '',
    'Total Cost (€)': row.totalCost || 0,
    'Description': row.description || ''
  }));
  
  exportToExcel(formattedData, filename);
};
