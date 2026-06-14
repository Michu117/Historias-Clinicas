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

  const handleExport = async (format: 'pdf' | 'csv') => {
  setIsExporting(true);
  try {
    // 1. Limpiamos cualquier extensión previa del nombre
    const baseName = filename ? filename.replace(/\.(pdf|csv)$/i, '') : 'reporte';

    // 2. Construimos el nombre final con la extensión correcta
    const finalFilename = `${baseName}.${format}`;

    exportReport(data, {
      format,
      columns,
      filename: finalFilename // Usamos el nombre limpio + extensión correcta
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
        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        {isExporting ? 'Exportando...' : 'Exportar'}
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-lg z-10">
          <button
            onClick={() => handleExport('csv')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md"
          >
            📄 Exportar CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-md"
          >
            📋 Exportar PDF
          </button>
        </div>
      )}
    </div>
  );
}

