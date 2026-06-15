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
import { listUsers, createUser, updateUser, User, RegisterPayload } from '../utils/authApi'
import { useAuth } from '../hooks/useAuth'

const DEBOUNCE_MS = 300

const ITEMS_PER_PAGE = 8

const SEXO_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
]

const ROL_OPTIONS = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'medico', label: 'Médico' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'trabajo_social', label: 'Trabajo Social' },
  { value: 'auditor', label: 'Auditor' },
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
      await createUser(createForm as RegisterPayload)
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
            <h1 className="text-2xl font-bold text-[#141b2b]">Directorio de Usuarios</h1>
            <p className="text-sm text-[#424752] mt-1">Administra los accesos y roles del personal del hospital.</p>
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
                ...ROL_OPTIONS,
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
                      <div className="font-medium text-[#141b2b]">
                        {u.usuario ? `${u.usuario.nombre} ${u.usuario.apellido}` : 'Sin perfil'}
                      </div>
                      <div className="text-sm text-[#424752]">{u.correo}</div>
                    </TableCell>
                    <TableCell>{u.rol?.nombre || 'Sin rol'}</TableCell>
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
                  <TableCell colSpan={4} className="text-center text-[#424752]">
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
                  <label className="block text-sm font-medium text-[#424752]">Nombre</label>
                  <p className="text-[#141b2b]">{viewUser.usuario?.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#424752]">Apellido</label>
                  <p className="text-[#141b2b]">{viewUser.usuario?.apellido || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752]">Cédula</label>
                <p className="text-[#141b2b]">{viewUser.usuario?.cedula || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752]">Correo electrónico</label>
                <p className="text-[#141b2b]">{viewUser.correo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752]">Fecha de nacimiento</label>
                <p className="text-[#141b2b]">{viewUser.usuario?.fechaNacimiento || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#424752]">Sexo</label>
                  <p className="text-[#141b2b]">
                    {viewUser.usuario?.sexo === 'H' ? 'Hombre' : viewUser.usuario?.sexo === 'M' ? 'Mujer' : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#424752]">Rol</label>
                  <p className="text-[#141b2b]">{viewUser.rol?.nombre || 'Sin rol'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752]">Estado</label>
                <p className="text-[#141b2b]">{viewUser.esActiva ? 'Activo' : 'Inactivo'}</p>
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
              <label className="block text-sm font-medium text-[#424752] mb-1">Nombre</label>
              <Input value={editForm.nombre} onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Apellido</label>
              <Input value={editForm.apellido} onChange={(e) => setEditForm((p) => ({ ...p, apellido: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Sexo</label>
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
            <p className="text-sm text-[#424752] mb-4">Ingresa los datos para registrar un nuevo perfil en el sistema.</p>

            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Nombre completo</label>
              <Input placeholder="Nombre y apellido" value={createForm.nombre} onChange={handleCreateField('nombre')} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#424752] mb-1">Apellido</label>
                <Input placeholder="Apellido" value={createForm.apellido} onChange={handleCreateField('apellido')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752] mb-1">Cédula</label>
                <Input placeholder="0102030405" value={createForm.cedula} onChange={handleCreateField('cedula')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Correo institucional</label>
              <Input type="email" placeholder="correo@hospital.com" value={createForm.correo} onChange={handleCreateField('correo')} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Contraseña provisional</label>
              <Input type="password" placeholder="••••••••" value={createForm.clave} onChange={handleCreateField('clave')} required minLength={8} />
              <p className="text-xs text-[#424752] mt-1">El usuario deberá cambiarla en su primer ingreso.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#424752] mb-1">Fecha de nacimiento</label>
                <Input type="date" value={createForm.fechaNacimiento} onChange={handleCreateField('fechaNacimiento')} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#424752] mb-1">Sexo</label>
                <Select options={SEXO_OPTIONS} value={createForm.sexo} onChange={handleCreateField('sexo')} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#424752] mb-1">Rol del sistema</label>
              <Select options={ROL_OPTIONS} value={createForm.rol} onChange={handleCreateField('rol')} required />
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
