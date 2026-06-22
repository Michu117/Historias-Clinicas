import React, { useState } from 'react';
import { exportReport } from '../service/exportService';

interface ExportButtonProps {
  data: any[];
  columns: string[];
  filename?: string;
  disabled?: boolean;
}

export default function ExportButton({
  data,
  columns,
  filename,
  disabled = false
}: ExportButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const handleExport = async (format: 'pdf' | 'csv') => {
  setIsExporting(true);
  try {
    const baseName = filename ? filename.replace(/\.(pdf|csv)$/i, '') : 'reporte';

    const finalFilename = `${baseName}.${format}`;

    exportReport(data, {
      format,
      columns,
      filename: finalFilename
    });
  } catch (error) {
    console.error('Export error:', error);
  } finally {
    setIsExporting(false);
    setIsOpen(false);
  }
};

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || data.length === 0 || isExporting}
        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled || data.length === 0 || isExporting ? 'var(--surface-container-high)' : 'var(--btn-success-bg)',
          color: 'var(--btn-success-text)'
        }}
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        {isExporting ? 'Exportando...' : 'Exportar'}
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute right-0 mt-2 w-32 rounded-md shadow-lg z-10"
          style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}
        >
          <button
            onClick={() => handleExport('csv')}
            className="block w-full text-left px-4 py-2 text-sm first:rounded-t-md"
            style={{
              color: 'var(--on-surface-variant)',
              backgroundColor: hoveredIdx === 0 ? 'var(--surface-container-low)' : undefined
            }}
            onMouseEnter={() => setHoveredIdx(0)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            📄 Exportar CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="block w-full text-left px-4 py-2 text-sm last:rounded-b-md"
            style={{
              color: 'var(--on-surface-variant)',
              backgroundColor: hoveredIdx === 1 ? 'var(--surface-container-low)' : undefined
            }}
            onMouseEnter={() => setHoveredIdx(1)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            📋 Exportar PDF
          </button>
        </div>
      )}
    </div>
  );
}
