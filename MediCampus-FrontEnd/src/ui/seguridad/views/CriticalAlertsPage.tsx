import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { exportAuditLogs, listAuditLogs, AuditLogEntry } from '../utils/authApi'

interface Incident {
  time: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
}

const SEVERITY_MAP: Record<string, { severity: Incident['severity']; title: string }> = {
  'Registro': { severity: 'info', title: 'Registro de Nueva Cuenta' },
  'Inicio de sesión': { severity: 'info', title: 'Inicio de Sesión' },
  'Inicio de sesión fallido': { severity: 'critical', title: 'Intento de Acceso Crítico' },
  'Refresco de token': { severity: 'info', title: 'Refresco de Token' },
  'Acceso': { severity: 'info', title: 'Acceso a Módulo' },
  'Cambio de rol': { severity: 'warning', title: 'Escalada de Privilegios' },
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
}

function logToIncident(log: AuditLogEntry): Incident {
  const config = SEVERITY_MAP[log.tipoAccion] || { severity: 'info' as const, title: log.tipoAccion }
  let description = log.detalle || `Usuario: ${log.correo}`
  if (log.direccionIp) {
    description += ` desde IP ${log.direccionIp}`
  }
  return {
    time: formatTime(log.fechaHora),
    title: config.title,
    description,
    severity: config.severity,
  }
}

const PAGE_SIZE = 10

const CriticalAlertsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportForm, setExportForm] = useState({ startDate: '', endDate: '' })

  useEffect(() => {
    listAuditLogs({ limite: 50 })
      .then((logs) => setIncidents(logs.map(logToIncident)))
      .catch(() => setError('No se pudieron cargar las alertas.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = incidents.slice(0, visibleCount)
  const hasMore = visibleCount < incidents.length

  const severityVariant = (s: Incident['severity']): 'danger' | 'warning' | 'neutral' => {
    if (s === 'critical') return 'danger'
    if (s === 'warning') return 'warning'
    return 'neutral'
  }

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length

  return (
    <ProtectedRoute permission="alerts.view">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--hc-text)]">Alertas Críticas</h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">Monitoreo en tiempo real de eventos de alto riesgo</p>
          </div>
          <Button variant="danger" onClick={() => setShowExport(true)}>
            Exportar Logs de Auditoría
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <CardTitle>Amenazas Activas</CardTitle>
              </div>
              <span className="text-3xl font-bold text-red-600">{criticalCount}</span>
              <p className="text-sm text-[var(--on-surface-variant)] mt-1">Requieren revisión inmediata</p>
            </Card>

            <Card>
              <CardTitle>Integridad del Sistema</CardTitle>
              <div className="mt-3">
                <Badge variant="success">Solo Lectura</Badge>
                <p className="text-sm text-[var(--on-surface-variant)] mt-2">Todos los logs son inmutables. El registro de auditoría está protegido contra modificaciones.</p>
              </div>
            </Card>
          </div>

          <Card>
            <CardTitle className="mb-4">Línea de Tiempo de Incidentes</CardTitle>
            {loading ? (
              <p className="text-sm text-[var(--on-surface-variant)]">Cargando alertas...</p>
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-[var(--on-surface-variant)]">No hay incidentes registrados.</p>
            ) : (
              <div className="space-y-4">
                {visible.map((incident, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l-2 border-[var(--outline)] last:pb-0">
                    <div className={`absolute left-[-5px] top-1 w-2 h-2 rounded-full ${
                      incident.severity === 'critical' ? 'bg-red-500' : incident.severity === 'warning' ? 'bg-yellow-500' : 'bg-slate-400'
                    }`} />
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-[var(--on-surface-variant)]">{incident.time}</span>
                      <Badge variant={severityVariant(incident.severity)}>
                        {incident.severity === 'critical' ? 'Crítico' : incident.severity === 'warning' ? 'Advertencia' : 'Info'}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-[var(--hc-text)] text-sm">{incident.title}</h4>
                    <p className="text-sm text-[var(--on-surface-variant)] mt-1">{incident.description}</p>
                  </div>
                ))}
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="w-full text-sm text-[var(--primary)] hover:underline py-2 cursor-pointer bg-transparent border-none"
                  >
                    Ver más ({incidents.length - visibleCount} restantes)
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>

        <Modal open={showExport} onClose={() => setShowExport(false)} title="Exportar Logs de Auditoría">
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-global p-3 flex items-center gap-2">
              <Badge variant="success">Integridad Garantizada</Badge>
              <span className="text-sm text-green-700">Los logs exportados están firmados criptográficamente para cumplimiento de solo lectura.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Fecha inicio</label>
                <Input type="date" value={exportForm.startDate} onChange={(e) => setExportForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Fecha fin</label>
                <Input type="date" value={exportForm.endDate} onChange={(e) => setExportForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowExport(false)}>Cancelar</Button>
              <Button variant="primary" onClick={async () => { setExporting(true); await exportAuditLogs({ fecha_desde: exportForm.startDate || undefined, fecha_hasta: exportForm.endDate || undefined, formato: 'csv' }); setExporting(false); setShowExport(false) }} disabled={exporting}>
                {exporting ? 'Exportando...' : 'CSV'}
              </Button>
              <Button variant="primary" onClick={async () => { setExporting(true); await exportAuditLogs({ fecha_desde: exportForm.startDate || undefined, fecha_hasta: exportForm.endDate || undefined, formato: 'pdf' }); setExporting(false); setShowExport(false) }} disabled={exporting}>
                {exporting ? 'Exportando...' : 'PDF'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

export default CriticalAlertsPage
