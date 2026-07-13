import React, { useState, useEffect, useRef } from 'react';
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
  disabled = false,
}: ExportButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printTriggered = useRef(false);

  useEffect(() => {
    if (isPrinting && !printTriggered.current) {
      printTriggered.current = true;
      const handleAfterPrint = () => {
        setIsPrinting(false);
        printTriggered.current = false;
      };
      window.addEventListener('afterprint', handleAfterPrint);
      window.print();
      return () => window.removeEventListener('afterprint', handleAfterPrint);
    }
    if (!isPrinting) {
      printTriggered.current = false;
    }
  }, [isPrinting]);

  const handleExport = async (format: 'pdf' | 'csv') => {
  if (format === 'pdf') {
    setIsOpen(false);
    setIsPrinting(true);
    return;
  }

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
    <>
      {isPrinting && (
        <div className="print-only">
          <div className="print-report" style={{ padding: '1cm' }}>
            <div className="print-header">
              <h1>Exportación de Datos</h1>
              <p>Generado el {new Date().toLocaleDateString('es-EC')}</p>
            </div>
            <table className="w-full text-sm border-collapse" style={{ border: '1px solid #bdc9c8' }}>
              <thead>
                <tr className="bg-[#f0f4f3]">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left font-semibold text-[#181c1c] border border-[#bdc9c8]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2 border border-[#bdc9c8] text-[#3e4948]">
                        {row[col] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={`relative inline-block ${isPrinting ? 'no-print' : ''}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || data.length === 0 || isExporting || isPrinting}
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
    </>
  );
}
