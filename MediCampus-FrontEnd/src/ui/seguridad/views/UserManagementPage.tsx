import React, { useEffect, useState, useCallback } from 'react'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { Card, CardTitle } from '../../components/Card'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Modal } from '../../components/Modal'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/Table'
import { Pagination } from '../../components/Pagination'
import { listUsers, createUser, updateUser, listRoles, User, Role, RegisterPayload } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

const DEBOUNCE_MS = 300

const ITEMS_PER_PAGE = 8

const SEXO_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
]

const EXCLUDED_ROLES = ['paciente']

const FALLBACK_ROLES: { value: string; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'medico', label: 'Médico' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'odontologo', label: 'Odontólogo' },
  { value: 'trabajador_social', label: 'Trabajo Social' },
  { value: 'estudiante', label: 'Estudiante' },
]

const UserManagementPage: React.FC = () => {
  const { token } = useAuth()
  const isAuthenticated = !!token
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    correo: '',
    clave: '',
    nombre: '',
    apellido: '',
    cedula: '',
    fechaNacimiento: '',
    sexo: '',
    rol: '',
  })
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', sexo: '' })
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      listRoles().then(setRoles).catch(() => {})
    }
  }, [isAuthenticated])

  const roleOptions = (() => {
    const apiRoles = roles
      .filter((r) => !EXCLUDED_ROLES.includes(r.nombre))
      .map((r) => ({ value: r.nombre, label: r.nombre }));
    const merged = new Map<string, { value: string; label: string }>();
    for (const r of FALLBACK_ROLES) merged.set(r.value, r);
    for (const r of apiRoles) merged.set(r.value, r);
    return [...merged.values()];
  })()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const activoMap: Record<string, string> = { activo: 'true', inactivo: 'false' }
      const data = await listUsers({
        rol: filterRole || undefined,
        activo: filterStatus ? activoMap[filterStatus] : undefined,
        busqueda: debouncedSearch || undefined,
      })
      setUsers(data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, filterRole, filterStatus, debouncedSearch])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE))
  const paginated = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleCreateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setCreateForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const openEditModal = (u: User) => {
    setEditingUser(u)
    setEditForm({
      nombre: u.usuario?.nombre || '',
      apellido: u.usuario?.apellido || '',
      sexo: u.usuario?.sexo || '',
    })
    setEditError('')
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setEditError('')
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      if (editForm.nombre) payload.nombre = editForm.nombre
      if (editForm.apellido) payload.apellido = editForm.apellido
      if (editForm.sexo) payload.sexo = editForm.sexo
      await updateUser(editingUser.id, payload)
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (u: User) => {
    try {
      await updateUser(u.id, { esActiva: !u.esActiva })
      loadUsers()
    } catch {
      // silent
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const createPayload: RegisterPayload = { ...createForm, roles: [createForm.rol] }
      await createUser(createPayload)
      setShowCreateModal(false)
      setCreateForm({ correo: '', clave: '', nombre: '', apellido: '', cedula: '', fechaNacimiento: '', sexo: '', rol: '' })
      loadUsers()
    } catch (err: any) {
      if (err.body) {
        try {
          const body = JSON.parse(err.body)
          const msgs = Object.values(body).flat().join('. ')
          setCreateError(msgs)
        } catch {
          setCreateError(err.body)
        }
      } else {
        setCreateError(err.message || 'Error al crear usuario')
      }
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (activa: boolean) => {
    if (activa) return <Badge variant="success">Activo</Badge>
    return <Badge variant="danger">Inactivo</Badge>
  }

  return (
    <ProtectedRoute permission="users.manage">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--hc-text)]">Directorio de Usuarios</h1>
            <p className="text-sm text-[var(--on-surface-variant)] mt-1">Administra los accesos y roles del personal del hospital.</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            + Crear Usuario
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="w-64">
            <Input
              type="text"
              placeholder="Buscar por nombre, correo o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              options={[
                { value: '', label: 'Todos los Roles' },
                ...roleOptions,
              ]}
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1) }}
            />
          </div>
          <div className="w-48">
            <Select
              options={[
                { value: '', label: 'Todos los Estados' },
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
              ]}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre y Correo</TableHead>
                <TableHead>Rol Principal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-[var(--hc-text)]">
                        {u.usuario ? `${u.usuario.nombre} ${u.usuario.apellido}` : 'Sin perfil'}
                      </div>
                      <div className="text-sm text-[var(--on-surface-variant)]">{u.correo}</div>
                    </TableCell>
                    <TableCell>{u.roles?.[0]?.nombre || 'Sin rol'}</TableCell>
                    <TableCell>{getStatusBadge(u.esActiva)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="tertiary" size="sm" onClick={() => setViewUser(u)}>Ver</Button>
                        <Button variant="tertiary" size="sm" onClick={() => openEditModal(u)}>Editar</Button>
                        <Button variant="tertiary" size="sm" onClick={() => handleToggleStatus(u)}>{u.esActiva ? 'Bloquear' : 'Activar'}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--on-surface-variant)]">
                    {loading ? 'Cargando...' : isAuthenticated ? 'No hay usuarios registrados' : 'Inicia sesión para ver usuarios'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {users.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex justify-end">
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </div>
          )}
        </Card>

        <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="Detalles del Usuario">
          {viewUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Nombre</label>
                  <p className="text-[var(--hc-text)]">{viewUser.usuario?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Apellido</label>
                  <p className="text-[var(--hc-text)]">{viewUser.usuario?.apellido || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Cédula</label>
                <p className="text-[var(--hc-text)]">{viewUser.usuario?.cedula || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Correo electrónico</label>
                <p className="text-[var(--hc-text)]">{viewUser.correo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Fecha de nacimiento</label>
                <p className="text-[var(--hc-text)]">{viewUser.usuario?.fechaNacimiento || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Sexo</label>
                  <p className="text-[var(--hc-text)]">
                    {viewUser.usuario?.sexo === 'H' ? 'Hombre' : viewUser.usuario?.sexo === 'M' ? 'Mujer' : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Rol</label>
                  <p className="text-[var(--hc-text)]">{viewUser.roles?.[0]?.nombre || 'Sin rol'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)]">Estado</label>
                <p className="text-[var(--hc-text)]">{viewUser.esActiva ? 'Activo' : 'Inactivo'}</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={() => setViewUser(null)}>Cerrar</Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Usuario">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Nombre</label>
              <Input value={editForm.nombre} onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Apellido</label>
              <Input value={editForm.apellido} onChange={(e) => setEditForm((p) => ({ ...p, apellido: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Sexo</label>
              <Select
                options={SEXO_OPTIONS}
                value={editForm.sexo}
                onChange={(e) => setEditForm((p) => ({ ...p, sexo: e.target.value }))}
                required
              />
            </div>
            {editError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
                {editError}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setEditingUser(null)}>Cancelar</Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear Nuevo Usuario">
          <form onSubmit={handleCreate} className="space-y-4">
            <p className="text-sm text-[var(--on-surface-variant)] mb-4">Ingresa los datos para registrar un nuevo perfil en el sistema.</p>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Nombre completo<span className="text-red-500 ml-0.5">*</span></label>
              <Input placeholder="Nombres" value={createForm.nombre} onChange={handleCreateField('nombre')} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Apellido<span className="text-red-500 ml-0.5">*</span></label>
                <Input placeholder="Apellidos" value={createForm.apellido} onChange={handleCreateField('apellido')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Cédula<span className="text-red-500 ml-0.5">*</span></label>
                <Input placeholder="0102030405" value={createForm.cedula} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); setCreateForm((p) => ({ ...p, cedula: v })) }} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Correo institucional<span className="text-red-500 ml-0.5">*</span></label>
              <Input type="email" placeholder="correo@hospital.com" value={createForm.correo} onChange={handleCreateField('correo')} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Contraseña provisional<span className="text-red-500 ml-0.5">*</span></label>
              <Input type="password" placeholder="••••••••" value={createForm.clave} onChange={handleCreateField('clave')} required minLength={8} />
              <p className="text-xs text-[var(--on-surface-variant)] mt-1">El usuario deberá cambiarla en su primer ingreso.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Fecha de nacimiento<span className="text-red-500 ml-0.5">*</span></label>
                <Input type="date" value={createForm.fechaNacimiento} onChange={handleCreateField('fechaNacimiento')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Sexo<span className="text-red-500 ml-0.5">*</span></label>
                <Select options={SEXO_OPTIONS} value={createForm.sexo} onChange={handleCreateField('sexo')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant)] mb-1">Rol del sistema<span className="text-red-500 ml-0.5">*</span></label>
              <Select options={roleOptions} value={createForm.rol} onChange={handleCreateField('rol')} required />
            </div>

            {createError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-global p-3" role="alert">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar Usuario'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

export default UserManagementPage
