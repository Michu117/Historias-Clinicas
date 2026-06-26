import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Card, CardTitle } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { listUsers, createUser, updateUser, listRoles, getUserDetail } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';
import type { User, Role } from '../../../types';

const ITEMS_PER_PAGE = 8;
const SEXO_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
];

const FALLBACK_ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'medico', label: 'Médico' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'odontologo', label: 'Odontólogo' },
  { value: 'trabajador_social', label: 'Trabajo Social' },
  { value: 'estudiante', label: 'Estudiante' },
];

interface UserManagementScreenProps {
  navigation: any;
}

export function UserManagementScreen({}: UserManagementScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ correo: '', clave: '', nombre: '', apellido: '', cedula: '', fechaNacimiento: '', sexo: '', rol: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', apellido: '', sexo: '' });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => { listRoles().then(setRoles).catch(() => {}); }, []);

  const roleOptions = FALLBACK_ROLES;
  const filteredRoles = roleOptions.filter(r => filterRole ? r.value === filterRole : true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers({
        rol: filterRole || undefined,
        activo: filterStatus || undefined,
        busqueda: searchTerm || undefined,
      });
      setUsers(data);
    } catch { /* noop */ } finally { setLoading(false); }
  }, [filterRole, filterStatus, searchTerm]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE));
  const paginated = users.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditForm({
      nombre: u.usuario?.nombre || '',
      apellido: u.usuario?.apellido || '',
      sexo: u.usuario?.sexo || '',
    });
    setEditError('');
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    setEditError('');
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      if (editForm.nombre) payload.nombre = editForm.nombre;
      if (editForm.apellido) payload.apellido = editForm.apellido;
      if (editForm.sexo) payload.sexo = editForm.sexo;
      await updateUser(editingUser.id, payload);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar usuario');
    } finally { setSaving(false); }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      await updateUser(u.id, { esActiva: !u.esActiva });
      loadUsers();
    } catch { /* noop */ }
  };

  const handleCreate = async () => {
    setCreateError('');
    setCreating(true);
    try {
      await createUser({ ...createForm, roles: [createForm.rol] });
      setShowCreateModal(false);
      setCreateForm({ correo: '', clave: '', nombre: '', apellido: '', cedula: '', fechaNacimiento: '', sexo: '', rol: '' });
      loadUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Error al crear usuario');
    } finally { setCreating(false); }
  };

  const getStatusBadge = (activa: boolean) => activa
    ? <Badge variant="success">Activo</Badge>
    : <Badge variant="danger">Inactivo</Badge>;

  const renderUser = ({ item }: { item: User }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
      <View style={{ flex: 2 }}>
        <Text style={{ fontWeight: '500', color: colors.hcText }}>{item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : 'Sin perfil'}</Text>
        <Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>{item.correo}</Text>
      </View>
      <View style={{ flex: 1 }}><Text style={{ color: colors.onSurfaceVariant, fontSize: 13 }}>{item.roles?.[0]?.nombre || 'Sin rol'}</Text></View>
      <View style={{ flex: 1 }}>{getStatusBadge(item.esActiva)}</View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Button variant="tertiary" size="sm" onPress={() => setViewUser(item)}>Ver</Button>
        <Button variant="tertiary" size="sm" onPress={() => openEditModal(item)}>Editar</Button>
        <Button variant="tertiary" size="sm" onPress={() => handleToggleStatus(item)}>{item.esActiva ? 'Bloquear' : 'Activar'}</Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.hcText }}>Directorio de Usuarios</Text>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>Administra los accesos y roles del personal del hospital.</Text>
          </View>
          <Button variant="primary" onPress={() => setShowCreateModal(true)}>+ Crear</Button>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1 }}><Input placeholder="Buscar..." value={searchTerm} onChangeText={setSearchTerm} /></View>
          <View style={{ flex: 1 }}>
            <Select options={[{ value: '', label: 'Todos los Roles' }, ...roleOptions]} value={filterRole} onChange={(v) => { setFilterRole(v); setPage(1); }} />
          </View>
          <View style={{ flex: 1 }}>
            <Select options={[{ value: '', label: 'Todos los Estados' }, { value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]} value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} />
          </View>
        </View>

        <Card style={{ padding: 0 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surfaceContainerLow, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <Text style={{ flex: 2, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Nombre y Correo</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Rol</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Estado</Text>
            <Text style={{ width: 150, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Acciones</Text>
          </View>
          {paginated.length > 0 ? paginated.map((u) => (
            <View key={u.id} style={{ paddingHorizontal: 16 }}>{renderUser({ item: u })}</View>
          )) : (
            <Text style={{ textAlign: 'center', padding: 24, color: colors.onSurfaceVariant }}>
              {loading ? 'Cargando...' : 'No hay usuarios registrados'}
            </Text>
          )}
          {users.length > ITEMS_PER_PAGE && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        </Card>

        <Modal visible={!!viewUser} onClose={() => setViewUser(null)} title="Detalles del Usuario">
          {viewUser && (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Nombre</Text><Text style={{ color: colors.hcText }}>{viewUser.usuario?.nombre || '-'}</Text></View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Apellido</Text><Text style={{ color: colors.hcText }}>{viewUser.usuario?.apellido || '-'}</Text></View>
              </View>
              <View><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Cédula</Text><Text style={{ color: colors.hcText }}>{viewUser.usuario?.cedula || '-'}</Text></View>
              <View><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Correo</Text><Text style={{ color: colors.hcText }}>{viewUser.correo}</Text></View>
              <View><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Rol</Text><Text style={{ color: colors.hcText }}>{viewUser.roles?.[0]?.nombre || 'Sin rol'}</Text></View>
              <View><Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Estado</Text><Text style={{ color: colors.hcText }}>{viewUser.esActiva ? 'Activo' : 'Inactivo'}</Text></View>
              <Button variant="secondary" onPress={() => setViewUser(null)}>Cerrar</Button>
            </View>
          )}
        </Modal>

        <Modal visible={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Usuario">
          <Input label="Nombre" value={editForm.nombre} onChangeText={(v) => setEditForm(p => ({ ...p, nombre: v }))} />
          <Input label="Apellido" value={editForm.apellido} onChangeText={(v) => setEditForm(p => ({ ...p, apellido: v }))} />
          <Select label="Sexo" options={SEXO_OPTIONS} value={editForm.sexo} onChange={(v) => setEditForm(p => ({ ...p, sexo: v }))} />
          {editError ? <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>{editError}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="secondary" onPress={() => setEditingUser(null)}>Cancelar</Button>
            <Button variant="primary" onPress={handleEdit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
          </View>
        </Modal>

        <Modal visible={showCreateModal} onClose={() => setShowCreateModal(false)} title="Crear Nuevo Usuario">
          <Input label="Nombre" required value={createForm.nombre} onChangeText={(v) => setCreateForm(p => ({ ...p, nombre: v }))} />
          <Input label="Apellido" required value={createForm.apellido} onChangeText={(v) => setCreateForm(p => ({ ...p, apellido: v }))} />
          <Input label="Cédula" required value={createForm.cedula} onChangeText={(v) => setCreateForm(p => ({ ...p, cedula: v.replace(/\D/g, '').slice(0, 10) }))} />
          <Input label="Correo" required value={createForm.correo} onChangeText={(v) => setCreateForm(p => ({ ...p, correo: v }))} keyboardType="email-address" />
          <Input label="Contraseña provisional" required value={createForm.clave} onChangeText={(v) => setCreateForm(p => ({ ...p, clave: v }))} secureTextEntry />
          <Input label="Fecha de nacimiento" required value={createForm.fechaNacimiento} onChangeText={(v) => setCreateForm(p => ({ ...p, fechaNacimiento: v }))} />
          <Select label="Sexo" required options={SEXO_OPTIONS} value={createForm.sexo} onChange={(v) => setCreateForm(p => ({ ...p, sexo: v }))} />
          <Select label="Rol del sistema" required options={roleOptions} value={createForm.rol} onChange={(v) => setCreateForm(p => ({ ...p, rol: v }))} />
          {createError ? <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>{createError}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
            <Button variant="secondary" onPress={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button variant="primary" onPress={handleCreate} disabled={creating}>{creating ? 'Guardando...' : 'Guardar Usuario'}</Button>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
