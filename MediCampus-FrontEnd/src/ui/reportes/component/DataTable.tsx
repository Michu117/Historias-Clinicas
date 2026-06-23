import React, { useState } from 'react';

interface DataTableProps {
  title: string;
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[];
  rows: any[];
  emptyMessage?: string;
}

export default function DataTable({
  title,
  columns,
  rows,
  emptyMessage = 'No hay datos disponibles'
}: DataTableProps): JSX.Element {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div
      className="rounded-lg shadow-sm"
      style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-lowest)' }}
    >
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--on-surface)' }}>{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)' }}>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-medium text-${col.align || 'left'}`}
                  style={{ color: 'var(--on-surface-variant)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--outline)',
                    backgroundColor: hoveredRow === idx ? 'var(--table-row-hover)' : undefined
                  }}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-6 py-3 text-${col.align || 'left'}`}
                      style={{ color: 'var(--on-surface)' }}
                    >
                      {row[col.key] || '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center" style={{ color: 'var(--card-text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
