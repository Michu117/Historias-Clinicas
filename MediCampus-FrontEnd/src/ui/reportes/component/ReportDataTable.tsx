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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredTh, setHoveredTh] = useState<string | null>(null);
  const [prevHovered, setPrevHovered] = useState(false);
  const [nextHovered, setNextHovered] = useState(false);

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
    <div
      className="rounded-lg shadow-sm overflow-hidden"
      style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--on-surface)' }}>{title}</h2>
        {allowExport && (
          <ExportButton
            data={data}
            columns={exportColumns}
            filename={`${title.toLowerCase().replace(/\s+/g, '-')}`}
          />
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'var(--surface-container-low)' }}>
            <tr style={{ borderBottom: '1px solid var(--outline-variant)' }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-semibold text-${col.align || 'left'} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  style={{
                    color: 'var(--on-surface-variant)',
                    borderRight: '1px solid var(--outline-variant)',
                    backgroundColor: col.sortable && hoveredTh === col.key ? 'var(--surface-container-low)' : undefined
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  onMouseEnter={() => col.sortable && setHoveredTh(col.key)}
                  onMouseLeave={() => setHoveredTh(null)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <span className="text-xs font-bold inline-block">
                        {sortDirection === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--outline-variant)',
                    backgroundColor: hoveredRow === idx ? 'var(--table-row-hover)' : undefined,
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 text-${col.align || 'left'}`}
                      style={{
                        color: 'var(--on-surface)',
                        borderRight: '1px solid var(--outline-variant)'
                      }}
                    >
                      {row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center" style={{ color: 'var(--card-text-muted)' }}>
                  <svg
                    className="mx-auto h-12 w-12 mb-2"
                    style={{ color: 'var(--card-text-muted)' }}
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

      <div
        className="px-6 py-4 flex items-center justify-between flex-col gap-3 md:flex-row"
        style={{ borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
          Pagina <span className="font-bold" style={{ color: 'var(--on-surface)' }}>{pagination.page}</span> de{' '}
          <span className="font-bold" style={{ color: 'var(--on-surface)' }}>{totalPages}</span> ({pagination.total} registros)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!canGoPrev}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed transition-colors"
            style={{
              border: '1px solid var(--outline)',
              backgroundColor: prevHovered && canGoPrev ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
              color: canGoPrev ? 'var(--on-surface-variant)' : 'var(--card-text-muted)'
            }}
            onMouseEnter={() => setPrevHovered(true)}
            onMouseLeave={() => setPrevHovered(false)}
          >
            ← Anterior
          </button>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!canGoNext}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium disabled:cursor-not-allowed transition-colors"
            style={{
              border: '1px solid var(--outline)',
              backgroundColor: nextHovered && canGoNext ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
              color: canGoNext ? 'var(--on-surface-variant)' : 'var(--card-text-muted)'
            }}
            onMouseEnter={() => setNextHovered(true)}
            onMouseLeave={() => setNextHovered(false)}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
