/**
 * CSV Export Utility
 * Converts JSON data to CSV format and triggers download
 */

export interface ExportData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: ExportData[], headers?: string[]): string => {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convert to string and escape quotes
      const stringValue = String(value).replace(/"/g, '""');
      
      // Wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Trigger CSV file download in browser
 */
export const downloadCSV = (data: ExportData[], filename: string, headers?: string[]): void => {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  }
};

/**
 * Format date for CSV export
 */
export const formatDateForCSV = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format currency for CSV export
 */
export const formatCurrencyForCSV = (amount: number, currency = '€'): string => {
  return `${currency}${amount.toFixed(2)}`;
};

/**
 * Export monthly report with custom formatting
 */
export const exportMonthlyReport = (
  data: ExportData[], 
  month: string,
  year: string | number
): void => {
  const filename = `monthly_report_${month}_${year}.csv`;
  
  // Define custom headers with user-friendly names
  const headers = [
    'Order Number',
    'Title',
    'Equipment',
    'Status',
    'Priority',
    'Assigned To',
    'Created Date',
    'Completed Date',
    'Due Date',
    'Parts Used',
    'Total Cost (€)',
    'Description'
  ];
  
  // Map data to match headers
  const formattedData = data.map(row => ({
    'Order Number': row.orderNumber,
    'Title': row.title,
    'Equipment': row.equipment,
    'Status': row.status,
    'Priority': row.priority,
    'Assigned To': row.assignedTo,
    'Created Date': row.createdAt,
    'Completed Date': row.completedAt,
    'Due Date': row.dueDate,
    'Parts Used': row.partsUsed,
    'Total Cost (€)': row.totalCost,
    'Description': row.description
  }));
  
  downloadCSV(formattedData, filename, headers);
};

/**
 * Generic CSV export function
 */
export const exportToCSV = (data: ExportData[], filename: string): void => {
  downloadCSV(data, filename);
};
