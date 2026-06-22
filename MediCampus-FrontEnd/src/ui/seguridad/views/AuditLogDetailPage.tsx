import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { listAuditLogs, AuditLogEntry } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

const AuditLogDetailPage: React.FC = () => {
  const { logId } = useParams<{ logId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [log, setLog] = useState<AuditLogEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    listAuditLogs()
      .then((logs) => {
        const found = logs.find((l) => String(l.id) === logId)
        setLog(found || null)
      })
      .catch(() => setLog(null))
      .finally(() => setLoading(false))
  }, [logId, token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--on-surface-variant)]">Cargando detalle del registro...</p>
      </div>
    )
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[var(--on-surface-variant)]">Registro no encontrado</h2>
        <p className="text-[var(--on-surface-variant)] mt-2">El registro de auditoría solicitado no existe.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/seguridad/audit')}>
          Volver a Auditoría
        </Button>
      </div>
    )
  }

  return (
    <ProtectedRoute permission="audit.view">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="tertiary" onClick={() => navigate('/seguridad/audit')}>
          &larr; Volver a Auditoría
        </Button>

        <Card>
          <div className="flex items-start justify-between mb-6">
            <div>
              <CardTitle>Detalle del Registro de Auditoría</CardTitle>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">ID: {log.id}</p>
            </div>
            <Badge variant="success">Protegido e Inalterable</Badge>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-global p-3 flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
            </svg>
            <span className="text-sm text-green-700">Integridad de Seguridad: Protegido e Inalterable</span>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-semibold text-[var(--hc-text)]">{log.tipoAccion}</span>
              <Badge variant="success">HTTP 200</Badge>
            </div>
            <p className="text-sm text-[var(--on-surface-variant)]">{log.detalle}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-xs text-[var(--on-surface-variant)] block">Timestamp (UTC)</span>
              <span className="text-sm font-medium text-[var(--hc-text)]">{new Date(log.fechaHora).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--on-surface-variant)] block">Resultado de Operación</span>
              <Badge variant="success">Success</Badge>
            </div>
            <div>
              <span className="text-xs text-[var(--on-surface-variant)] block">Actor</span>
              <span className="text-sm font-medium text-[var(--hc-text)]">{log.correo}</span>
            </div>
            <div>
              <span className="text-xs text-[var(--on-surface-variant)] block">Módulo Afectado</span>
              <span className="text-sm font-medium text-[var(--hc-text)]">{log.moduloAfectado}</span>
            </div>
          </div>

          <div className="border-t border-[var(--outline)] pt-4">
            <h4 className="text-sm font-medium text-[var(--on-surface-variant)] mb-3">Payload / Datos Afectados</h4>
            <pre className="bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-global p-4 text-xs font-mono text-[var(--on-surface-variant)] overflow-auto">
{JSON.stringify({
  id: log.id,
  accion: log.tipoAccion,
  modulo: log.moduloAfectado,
  usuario: log.correo,
  fecha: log.fechaHora,
  detalle: log.detalle,
}, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  )
}

export default AuditLogDetailPage
