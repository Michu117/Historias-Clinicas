/**
 * exportService.ts
 * Utility service for exporting reports to PDF/CSV
 */

export interface ExportOptions {
  filename?: string;
  format: 'pdf' | 'csv';
  columns: string[];
}

/**
 * Exports data to CSV format
 */
export function exportToCSV(
  data: any[],
  columns: string[],
  filename: string = 'reporte.csv'
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = columns.map(col => `"${col}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => `"${row[col] || ''}"`).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to PDF format (requires jsPDF library)
 * For now, provides a placeholder implementation
 */
export function exportToPDF(
  data: any[],
  columns: string[],
  filename: string = 'reporte.pdf'
): void {
  // Placeholder: requires external library like jsPDF
  // This would be implemented with jsPDF/html2pdf in production
  console.warn('PDF export requires jsPDF library - falling back to CSV');
  const csvFilename = filename.replace('.pdf', '.csv');
  exportToCSV(data, columns, csvFilename);
}

/**
 * Exports data based on format option
 */
export function exportReport(
  data: any[],
  options: ExportOptions
): void {
  const filename = options.filename || `reporte-${new Date().toISOString().split('T')[0]}`;
  const fullFilename = filename.endsWith(options.format)
    ? filename
    : `${filename}.${options.format}`;

  if (options.format === 'pdf') {
    exportToPDF(data, options.columns, fullFilename);
  } else if (options.format === 'csv') {
    exportToCSV(data, options.columns, fullFilename);
  }
}

