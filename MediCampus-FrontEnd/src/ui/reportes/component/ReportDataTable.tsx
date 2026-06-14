import React, { useState } from 'react';
import ExportButton from './ExportButton';
import type { Pagination } from '../types';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface ReportDataTableProps {
  data: any[];
  columns?: Column[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  title?: string;
  allowExport?: boolean;
}

const DEFAULT_COLUMNS: Column[] = [
  { key: 'fecha', label: 'Fecha', align: 'left' },
  { key: 'servicio', label: 'Servicio', align: 'left' },
  { key: 'consultas', label: 'Consultas', align: 'center', sortable: true }
];

export default function ReportDataTable({
  data,
  columns = DEFAULT_COLUMNS,
  pagination,
  onPageChange,
  onSort,
  title = 'Datos Detallados',
  allowExport = true
}: ReportDataTableProps): JSX.Element {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const canGoPrev = pagination.page > 1;
  const canGoNext = pagination.page < totalPages;
  const exportColumns = columns.map(c => c.key);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {allowExport && (
          <ExportButton
            data={data}
            columns={exportColumns}
            filename={`${title.toLowerCase().replace(/\s+/g, '-')}`}
          />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="divide-x divide-gray-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-semibold text-gray-700 text-${col.align || 'left'} ${
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2 justify-${col.align === 'center' ? 'center' : col.align === 'right' ? 'end' : 'start'}">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <span className="text-xs font-bold inline-block">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 transition-colors divide-x divide-gray-200">
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 text-gray-900 text-${col.align || 'left'}`}
                    >
                      {row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  Sin datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between flex-col gap-3 md:flex-row">
        <p className="text-sm text-gray-600 font-medium">
          Página <span className="font-bold text-gray-900">{pagination.page}</span> de{' '}
          <span className="font-bold text-gray-900">{totalPages}</span> ({pagination.total} registros)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!canGoPrev}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!canGoNext}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}


