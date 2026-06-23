import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Badge } from '../../components/Badge'

const KPIS = [
  { label: 'Accesos Totales', value: '12,485', change: '+4.5%', variant: 'success' as const },
  { label: 'Modificaciones', value: '3,291', change: '+1.2%', variant: 'success' as const },
  { label: 'Intentos Bloqueados', value: '142', change: '+12%', variant: 'danger' as const },
  { label: 'Actividades Sospechosas', value: '18', change: '-3%', variant: 'warning' as const },
]

const QUICK_LINKS = [
  { label: 'Usuarios y Roles', path: '/seguridad/users', desc: 'Gestiona usuarios, roles y permisos del sistema' },
  { label: 'Auditoría', path: '/seguridad/audit', desc: 'Revisa registros de actividad y logs de seguridad' },
  { label: 'Alertas Críticas', path: '/seguridad/alerts', desc: 'Monitorea eventos de alto riesgo en tiempo real' },
  { label: 'Asignación de Permisos', path: '/seguridad/permissions', desc: 'Configura permisos diferenciados por rol' },
]

const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <ProtectedRoute permission="security.dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--hc-text)]">Panel de Seguridad</h1>
          <p className="text-sm text-[var(--on-surface-variant)] mt-1">Monitoreo general del estado de seguridad del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPIS.map((kpi) => (
            <Card key={kpi.label} className="flex flex-col">
              <span className="text-sm text-[var(--on-surface-variant)]">{kpi.label}</span>
              <span className="text-3xl font-bold text-[var(--hc-text)] mt-1">{kpi.value}</span>
              <div className="mt-2">
                <Badge variant={kpi.variant}>{kpi.change} vs semana anterior</Badge>
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
