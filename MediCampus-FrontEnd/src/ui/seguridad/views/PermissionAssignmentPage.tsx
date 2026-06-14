import React, { useEffect, useState } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Select } from '../../components/Select'
import { ToggleSwitch } from '../../components/ToggleSwitch'
import { listRoles, Role } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

interface Permission {
  key: string
  label: string
  disabled?: boolean
  warning?: boolean
  badge?: string
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger'
}

interface ModulePermissions {
  module: string
  badge?: string
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger'
  permissions: Permission[]
}

const MODULES: ModulePermissions[] = [
  {
    module: 'Historias Clínicas',
    badge: 'Alta sensibilidad',
    badgeVariant: 'danger',
    permissions: [
      { key: 'historias.ver', label: 'Ver Registros (Lectura)' },
      { key: 'historias.crear', label: 'Crear Entradas' },
      { key: 'historias.editar', label: 'Editar Entradas Propias' },
      { key: 'historias.eliminar', label: 'Eliminar Registros', warning: true },
    ],
  },
  {
    module: 'Agendas y Turnos',
    permissions: [
      { key: 'agendas.ver', label: 'Ver Agenda Propia' },
      { key: 'agendas.sobreturnos', label: 'Gestionar Sobreturnos' },
      { key: 'agendas.cancelar', label: 'Cancelar Turnos' },
    ],
  },
  {
    module: 'Facturación y Finanzas',
    permissions: [
      { key: 'finanzas.ver', label: 'Ver Reportes Financieros', disabled: true },
      { key: 'finanzas.cargar', label: 'Cargar Prácticas' },
    ],
  },
  {
    module: 'Seguridad del Sistema',
    badge: 'Solo Admins',
    badgeVariant: 'warning',
    permissions: [
      { key: 'seguridad.users', label: 'Gestión de Usuarios' },
      { key: 'seguridad.audit', label: 'Auditoría de Logs' },
    ],
  },
]

const PermissionAssignmentPage: React.FC = () => {
  const { token } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [permState, setPermState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!token) return
    listRoles().then(setRoles).catch(() => {})
  }, [token])

  const allPerms = MODULES.flatMap((m) => m.permissions.map((p) => p.key))
  const allGranted = allPerms.length > 0 && allPerms.every((k) => permState[k])

  const handleToggleAll = () => {
    const next: Record<string, boolean> = {}
    for (const m of MODULES) {
      for (const p of m.permissions) {
        next[p.key] = !allGranted
      }
    }
    setPermState(next)
  }

  const toggle = (key: string) => {
    setPermState((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ProtectedRoute permission="security.permissions">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asignación de Permisos</h1>
          <p className="text-sm text-slate-500 mt-1">Configura los permisos diferenciados para cada rol del sistema.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-72">
            <Select
              label="Rol del sistema"
              options={roles.map((r) => ({ value: r.nombre, label: r.nombre }))}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            />
          </div>
          <span className="text-sm text-slate-400 mt-6">
            {selectedRole ? `${roles.find((r) => r.nombre === selectedRole)?.descripcion || ''}` : 'Selecciona un rol'}
          </span>
        </div>

        {selectedRole && (
          <>
            <div className="flex items-center justify-between">
              <CardTitle>Permisos del Sistema</CardTitle>
              <Button variant="tertiary" onClick={handleToggleAll}>
                {allGranted ? 'Desmarcar todos' : 'Marcar todos'}
              </Button>
            </div>

            <div className="space-y-4">
              {MODULES.map((mod) => (
                <Card key={mod.module}>
                  <div className="flex items-center gap-2 mb-4">
                    <CardTitle>{mod.module}</CardTitle>
                    {mod.badge && (
                      <Badge variant={mod.badgeVariant || 'neutral'}>{mod.badge}</Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {mod.permissions.map((perm) => (
                      <div key={perm.key} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${perm.disabled ? 'text-slate-300' : 'text-slate-700'}`}>
                            {perm.label}
                          </span>
                          {perm.warning && (
                            <Badge variant="danger">Requiere autorización especial</Badge>
                          )}
                        </div>
                        <ToggleSwitch
                          checked={!!permState[perm.key]}
                          onChange={() => toggle(perm.key)}
                          disabled={perm.disabled}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setPermState({})}>
                Descartar
              </Button>
              <Button variant="primary">
                Guardar Permisos
              </Button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}

export default PermissionAssignmentPage
