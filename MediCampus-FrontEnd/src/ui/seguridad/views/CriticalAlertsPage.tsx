import React, { useState } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { exportAuditLogs } from '../utils/authApi'

interface Incident {
  time: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
}

const INCIDENTS: Incident[] = [
  {
    time: '10:42 AM',
    title: 'Intento de Acceso Crítico',
    description: 'Intento no autorizado de acceder a la base de datos de Pacientes desde IP desconocida 192.168.1.104 (ID: SYS_UNKNOWN)',
    severity: 'critical',
  },
  {
    time: '09:15 AM',
    title: 'Escalada de Privilegios',
    description: "El usuario 'dr.smith' elevó su rol a Administrador fuera de la ventana de mantenimiento programada",
    severity: 'warning',
  },
  {
    time: '08:02 AM',
    title: 'Exportación Masiva de Datos',
    description: 'Exportación masiva de registros de facturación iniciada por un servicio de fondo no reconocido',
    severity: 'warning',
  },
]

const CriticalAlertsPage: React.FC = () => {
  const [showExport, setShowExport] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportForm, setExportForm] = useState({ startDate: '', endDate: '' })

  const severityVariant = (s: Incident['severity']): 'danger' | 'warning' | 'neutral' => {
    if (s === 'critical') return 'danger'
    if (s === 'warning') return 'warning'
    return 'neutral'
  }

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
              <span className="text-3xl font-bold text-red-600">{INCIDENTS.filter((i) => i.severity === 'critical').length}</span>
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
            <div className="space-y-4">
              {INCIDENTS.map((incident, idx) => (
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
            </div>
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
