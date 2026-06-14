import React from 'react'
import AuditLogTable from './AuditLogTable'
import { useAuditLogs } from '../hooks/useAuditLogs'
import useAuditFilters from '../hooks/useAuditFilters'

export const AuditDashboard: React.FC = () => {
  const { logs, loading, refetch } = useAuditLogs()
  const { controls, apply } = useAuditFilters()

  const filtered = apply(logs)

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <input
          placeholder="Filtrar por usuario"
          value={controls.filterUser}
          onChange={(e) => controls.setFilterUser(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <select value={controls.riskFilter} onChange={(e) => controls.setRiskFilter(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Todos los niveles</option>
          <option value="low">Bajo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
        </select>
        <button onClick={() => void refetch()} className="bg-blue-600 text-white px-3 rounded">Refrescar</button>
      </div>

      <AuditLogTable logs={filtered} />
      {loading && <div className="mt-2 text-sm">Cargando registros...</div>}
    </div>
  )
}

export default AuditDashboard
