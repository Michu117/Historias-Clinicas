import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { listAuditLogs, AuditLogEntry } from '../utils/authApi'

interface KpiData {
  label: string
  value: string
  change: string
  variant: 'success' | 'danger' | 'warning'
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function countByType(logs: AuditLogEntry[], ...types: string[]): number {
  return logs.filter((l) => types.includes(l.tipoAccion)).length
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const diff = ((current - previous) / previous) * 100
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${diff.toFixed(1)}%`
}

const QUICK_LINKS = [
  { label: 'Usuarios y Roles', path: '/seguridad/users', desc: 'Gestiona usuarios, roles y permisos del sistema' },
  { label: 'Auditoría', path: '/seguridad/audit', desc: 'Revisa registros de actividad y logs de seguridad' },
  { label: 'Alertas Críticas', path: '/seguridad/alerts', desc: 'Monitorea eventos de alto riesgo en tiempo real' },
  { label: 'Asignación de Permisos', path: '/seguridad/permissions', desc: 'Configura permisos diferenciados por rol' },
]

const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<KpiData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = daysAgo(0)
    const weekAgo = daysAgo(7)
    const twoWeeksAgo = daysAgo(14)

    Promise.all([
      listAuditLogs({ fecha_desde: weekAgo, fecha_hasta: today, limite: 10000 }),
      listAuditLogs({ fecha_desde: twoWeeksAgo, fecha_hasta: weekAgo, limite: 10000 }),
    ])
      .then(([currentLogs, previousLogs]) => {
        const c = {
          accesos: countByType(currentLogs, 'Inicio de sesión', 'Acceso'),
          modificaciones: countByType(currentLogs, 'Registro', 'Cambio de rol'),
          bloqueados: countByType(currentLogs, 'Inicio de sesión fallido'),
          sospechosas: countByType(currentLogs, 'Inicio de sesión fallido'),
        }
        const p = {
          accesos: countByType(previousLogs, 'Inicio de sesión', 'Acceso'),
          modificaciones: countByType(previousLogs, 'Registro', 'Cambio de rol'),
          bloqueados: countByType(previousLogs, 'Inicio de sesión fallido'),
          sospechosas: countByType(previousLogs, 'Inicio de sesión fallido'),
        }
        setKpis([
          { label: 'Accesos Totales', value: c.accesos.toLocaleString(), change: `${pctChange(c.accesos, p.accesos)} vs semana anterior`, variant: 'success' },
          { label: 'Modificaciones', value: c.modificaciones.toLocaleString(), change: `${pctChange(c.modificaciones, p.modificaciones)} vs semana anterior`, variant: 'success' },
          { label: 'Intentos Bloqueados', value: c.bloqueados.toLocaleString(), change: `${pctChange(c.bloqueados, p.bloqueados)} vs semana anterior`, variant: 'danger' },
          { label: 'Actividades Sospechosas', value: c.sospechosas.toLocaleString(), change: `${pctChange(c.sospechosas, p.sospechosas)} vs semana anterior`, variant: 'warning' },
        ])
      })
      .catch(() => {
        setKpis([
          { label: 'Accesos Totales', value: '—', change: 'Sin datos', variant: 'success' },
          { label: 'Modificaciones', value: '—', change: 'Sin datos', variant: 'success' },
          { label: 'Intentos Bloqueados', value: '—', change: 'Sin datos', variant: 'danger' },
          { label: 'Actividades Sospechosas', value: '—', change: 'Sin datos', variant: 'warning' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute permission="security.dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--hc-text)]">Panel de Seguridad</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Monitoreo general del estado de seguridad del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="flex flex-col animate-pulse">
                  <div className="h-3 w-24 bg-[var(--surface-variant)] rounded" />
                  <div className="h-8 w-16 bg-[var(--surface-variant)] rounded mt-3" />
                  <div className="h-4 w-32 bg-[var(--surface-variant)] rounded mt-3" />
                </Card>
              ))
            : kpis.map((kpi) => (
                <Card key={kpi.label} className="flex flex-col">
                  <span className="text-sm text-[var(--on-surface-variant)]">{kpi.label}</span>
                  <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{kpi.value}</span>
                  <div className="mt-2">
                    <Badge variant={kpi.variant}>{kpi.change}</Badge>
                  </div>
                </Card>
              ))}
        </div>

        <div>
          <CardTitle className="mb-3">Acceso Rápido</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link) => (
              <Card
                key={link.path}
                className="cursor-pointer hover:border-[var(--primary)] transition-colors"
                onClick={() => navigate(link.path)}
              >
                <h3 className="font-semibold text-[var(--hc-text)]">{link.label}</h3>
                <p className="text-sm text-[var(--on-surface-variant)] mt-1">{link.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default SecurityDashboard
