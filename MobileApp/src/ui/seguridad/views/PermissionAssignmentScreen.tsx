import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { listRoles } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';
import type { Role } from '../../../types';

interface Permission { key: string; label: string; disabled?: boolean; warning?: boolean }
interface ModulePermissions { module: string; badge?: string; badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger'; permissions: Permission[] }

const MODULES: ModulePermissions[] = [
  { module: 'Historias Clínicas', badge: 'Alta sensibilidad', badgeVariant: 'danger', permissions: [
    { key: 'historias.ver', label: 'Ver Registros (Lectura)' },
    { key: 'historias.crear', label: 'Crear Entradas' },
    { key: 'historias.editar', label: 'Editar Entradas Propias' },
    { key: 'historias.eliminar', label: 'Eliminar Registros', warning: true },
  ]},
  { module: 'Agendas y Turnos', permissions: [
    { key: 'agendas.ver', label: 'Ver Agenda Propia' },
    { key: 'agendas.sobreturnos', label: 'Gestionar Sobreturnos' },
    { key: 'agendas.cancelar', label: 'Cancelar Turnos' },
  ]},
  { module: 'Facturación y Finanzas', permissions: [
    { key: 'finanzas.ver', label: 'Ver Reportes Financieros', disabled: true },
    { key: 'finanzas.cargar', label: 'Cargar Prácticas' },
  ]},
  { module: 'Seguridad del Sistema', badge: 'Solo Admins', badgeVariant: 'warning', permissions: [
    { key: 'seguridad.users', label: 'Gestión de Usuarios' },
    { key: 'seguridad.audit', label: 'Auditoría de Logs' },
  ]},
];

interface PermissionAssignmentScreenProps {
  navigation: any;
}

export function PermissionAssignmentScreen({}: PermissionAssignmentScreenProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [permState, setPermState] = useState<Record<string, boolean>>({});

  useEffect(() => { listRoles().then(setRoles).catch(() => {}); }, []);

  const allPerms = MODULES.flatMap(m => m.permissions.map(p => p.key));
  const allGranted = allPerms.length > 0 && allPerms.every(k => permState[k]);

  const handleToggleAll = () => {
    const next: Record<string, boolean> = {};
    for (const m of MODULES) for (const p of m.permissions) next[p.key] = !allGranted;
    setPermState(next);
  };

  const toggle = (key: string) => setPermState(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.hcText, marginBottom: 4 }}>Asignación de Permisos</Text>
        <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 16 }}>Configura los permisos diferenciados para cada rol del sistema.</Text>

        <Select
          label="Rol del sistema"
          options={roles.map(r => ({ value: r.nombre, label: r.nombre }))}
          value={selectedRole}
          onChange={setSelectedRole}
        />

        {selectedRole && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <CardTitle>Permisos del Sistema</CardTitle>
              <Button variant="tertiary" onPress={handleToggleAll}>{allGranted ? 'Desmarcar todos' : 'Marcar todos'}</Button>
            </View>

            <View style={{ gap: 12 }}>
              {MODULES.map(mod => (
                <Card key={mod.module}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <CardTitle>{mod.module}</CardTitle>
                    {mod.badge && <Badge variant={mod.badgeVariant || 'neutral'}>{mod.badge}</Badge>}
                  </View>
                  {mod.permissions.map(perm => (
                    <ToggleSwitch
                      key={perm.key}
                      label={perm.label}
                      checked={!!permState[perm.key]}
                      onChange={() => toggle(perm.key)}
                      disabled={perm.disabled}
                      warning={perm.warning}
                    />
                  ))}
                </Card>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
              <Button variant="secondary" onPress={() => setPermState({})}>Descartar</Button>
              <Button variant="primary">Guardar Permisos</Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
