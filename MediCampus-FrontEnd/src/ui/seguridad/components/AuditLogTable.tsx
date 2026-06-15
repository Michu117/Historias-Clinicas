import React from 'react'
import useAuditLogs, { AuditLog } from '../hooks/useAuditLogs'
import { formatDateISO } from '../utils/auditUtils'

type Props = { logs?: AuditLog[] }

export const AuditLogTable: React.FC<Props> = ({ logs: propLogs }) => {
  const { logs, loading, error } = useAuditLogs()
  const rows = propLogs ?? logs

  return (
    <div className="p-4">
      {error && (
        <div className="text-red-600 mb-2">Error cargando registros de auditoría</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" aria-label="audit-logs-table">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">IP</th>
              <th className="px-4 py-2 text-left">Operación</th>
              <th className="px-4 py-2 text-left">Nivel de riesgo</th>
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.user}</td>
                  <td className="px-4 py-2">{formatDateISO(r.date)}</td>
                  <td className="px-4 py-2">{r.ip}</td>
                  <td className="px-4 py-2">{r.operation}</td>
                  <td className="px-4 py-2">{r.riskLevel}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">
                  {loading ? 'Cargando...' : 'No hay registros'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AuditLogTable
