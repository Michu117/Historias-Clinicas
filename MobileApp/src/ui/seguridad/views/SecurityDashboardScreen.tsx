import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { colors } from '../../../utils/theme';

const KPIS = [
  { label: 'Accesos Totales', value: '12,485', change: '+4.5%', variant: 'success' as const },
  { label: 'Modificaciones', value: '3,291', change: '+1.2%', variant: 'success' as const },
  { label: 'Intentos Bloqueados', value: '142', change: '+12%', variant: 'danger' as const },
  { label: 'Actividades Sospechosas', value: '18', change: '-3%', variant: 'warning' as const },
];

const QUICK_LINKS = [
  { label: 'Usuarios y Roles', screen: 'UserManagement', desc: 'Gestiona usuarios, roles y permisos del sistema' },
  { label: 'Auditoría', screen: 'AuditDashboard', desc: 'Revisa registros de actividad y logs de seguridad' },
  { label: 'Alertas Críticas', screen: 'CriticalAlerts', desc: 'Monitorea eventos de alto riesgo en tiempo real' },
  { label: 'Asignación de Permisos', screen: 'PermissionAssignment', desc: 'Configura permisos diferenciados por rol' },
];

interface SecurityDashboardScreenProps {
  navigation: any;
}

export function SecurityDashboardScreen({ navigation }: SecurityDashboardScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.hcText }}>Panel de Seguridad</Text>
          <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Monitoreo general del estado de seguridad del sistema</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {KPIS.map((kpi) => (
            <Card key={kpi.label} style={{ flex: 1, minWidth: '45%' }}>
              <Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>{kpi.label}</Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.hcText, marginTop: 4 }}>{kpi.value}</Text>
              <View style={{ marginTop: 8 }}>
                <Badge variant={kpi.variant}>{kpi.change} vs semana anterior</Badge>
              </View>
            </Card>
          ))}
        </View>

        <CardTitle style={{ marginBottom: 12 }}>Acceso Rápido</CardTitle>
        <View style={{ gap: 12 }}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity key={link.screen} onPress={() => navigation.navigate(link.screen)}>
              <Card>
                <Text style={{ fontWeight: '600', color: colors.hcText }}>{link.label}</Text>
                <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>{link.desc}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
