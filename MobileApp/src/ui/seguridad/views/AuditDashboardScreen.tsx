import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { Card, CardTitle } from '../../components/Card';
import { Pagination } from '../../components/Pagination';
import { listAuditLogs, exportAuditLogs } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';
import type { AuditLogEntry, AuditLogFilters } from '../../../types';

const ITEMS_PER_PAGE = 8;
const TIPO_ACCION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'registro', label: 'Registro' },
  { value: 'inicio_sesion', label: 'Inicio de sesión' },
  { value: 'inicio_sesion_fallido', label: 'Inicio fallido' },
  { value: 'refresco_token', label: 'Refresco de token' },
  { value: 'cambio_rol', label: 'Cambio de rol' },
];

interface AuditDashboardScreenProps {
  navigation: any;
}

export function AuditDashboardScreen({ navigation }: AuditDashboardScreenProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({ fecha_desde: '', fecha_hasta: '', tipo_accion: '', usuario: '' });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAuditLogs(filters);
      setLogs(data);
      setPage(1);
    } catch { /* noop */ } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const totalPages = Math.max(1, Math.ceil(logs.length / ITEMS_PER_PAGE));
  const paginatedLogs = logs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const updateFilter = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }));

  const actionBadge = (accion: string) => {
    const lower = accion.toLowerCase();
    if (lower.includes('fallido') || lower.includes('sospech')) return <Badge variant="danger">{accion}</Badge>;
    if (lower.includes('cambio') || lower.includes('registro')) return <Badge variant="warning">{accion}</Badge>;
    return <Badge variant="success">{accion}</Badge>;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.hcText }}>Auditoría y Logs de Seguridad</Text>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>Registro de actividades del sistema</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button variant="secondary" size="sm" onPress={() => exportAuditLogs({ ...filters, formato: 'csv' })}>CSV</Button>
            <Button variant="secondary" size="sm" onPress={() => exportAuditLogs({ ...filters, formato: 'pdf' })}>PDF</Button>
            <Button variant="primary" size="sm" onPress={loadLogs} disabled={loading}>{loading ? '...' : 'Refrescar'}</Button>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Input placeholder="Fecha inicio" value={filters.fecha_desde || ''} onChangeText={(v) => updateFilter('fecha_desde', v)} />
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Input placeholder="Fecha fin" value={filters.fecha_hasta || ''} onChangeText={(v) => updateFilter('fecha_hasta', v)} />
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Select options={TIPO_ACCION_OPTIONS} value={filters.tipo_accion || ''} onChange={(v) => updateFilter('tipo_accion', v)} />
          </View>
          <View style={{ flex: 1, minWidth: 140 }}>
            <Input placeholder="Usuario" value={filters.usuario || ''} onChangeText={(v) => updateFilter('usuario', v)} />
          </View>
        </View>

        <Card style={{ padding: 0 }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.surfaceContainerLow, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Fecha/Hora</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Acción</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Usuario</Text>
            <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '600', color: colors.onSurfaceVariant }}>Detalle</Text>
          </View>
          {paginatedLogs.length > 0 ? paginatedLogs.map((log) => (
            <TouchableIndicator key={log.id} onPress={() => navigation.navigate('AuditLogDetail', { logId: String(log.id) })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
                <Text style={{ flex: 1.5, fontSize: 12, color: colors.onSurfaceVariant }}>{new Date(log.fechaHora).toLocaleString()}</Text>
                <View style={{ flex: 1 }}>{actionBadge(log.tipoAccion)}</View>
                <Text style={{ flex: 1, fontSize: 13, color: colors.hcText }}>{log.correo}</Text>
                <Text style={{ flex: 1.5, fontSize: 12, color: colors.onSurfaceVariant }} numberOfLines={2}>{log.detalle}</Text>
              </View>
            </TouchableIndicator>
          )) : (
            <Text style={{ textAlign: 'center', padding: 24, color: colors.onSurfaceVariant }}>
              {loading ? 'Cargando...' : 'No hay registros de auditoría'}
            </Text>
          )}
          {logs.length > ITEMS_PER_PAGE && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function TouchableIndicator({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
}
