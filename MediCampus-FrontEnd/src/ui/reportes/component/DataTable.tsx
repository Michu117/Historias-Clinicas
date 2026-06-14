import React from 'react';

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
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-6 py-3 font-medium text-gray-700 text-${col.align || 'left'}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
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
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
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

