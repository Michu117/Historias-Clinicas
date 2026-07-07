import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { listAuditLogs } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';
import type { AuditLogEntry } from '../../../types';

interface AuditLogDetailScreenProps {
  navigation: any;
  route: any;
}

export function AuditLogDetailScreen({ navigation, route }: AuditLogDetailScreenProps) {
  const { logId } = route.params;
  const [log, setLog] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listAuditLogs()
      .then((logs) => { setLog(logs.find((l) => String(l.id) === logId) || null); })
      .catch(() => setLog(null))
      .finally(() => setLoading(false));
  }, [logId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.onSurfaceVariant }}>Cargando detalle del registro...</Text>
      </SafeAreaView>
    );
  }

  if (!log) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.onSurfaceVariant }}>Registro no encontrado</Text>
        <Text style={{ color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>El registro de auditoría solicitado no existe.</Text>
        <Button variant="primary" style={{ marginTop: 16 }} onPress={() => navigation.goBack()}>Volver a Auditoría</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, maxWidth: 800, width: '100%', alignSelf: 'center' }}>
        <Button variant="tertiary" onPress={() => navigation.goBack()} style={{ marginBottom: 16, alignSelf: 'flex-start' }}>
          ← Volver a Auditoría
        </Button>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <View>
              <CardTitle>Detalle del Registro de Auditoría</CardTitle>
              <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>ID: {log.id}</Text>
            </View>
            <Badge variant="success">Protegido e Inalterable</Badge>
          </View>

          <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: radius.md, padding: 12, marginBottom: 24 }}>
            <Text style={{ color: '#166534', fontSize: 13 }}>Integridad de Seguridad: Protegido e Inalterable</Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.hcText, marginBottom: 4 }}>{log.tipoAccion}</Text>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant }}>{log.detalle}</Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <View><Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>Timestamp (UTC)</Text><Text style={{ fontSize: 14, fontWeight: '500', color: colors.hcText }}>{new Date(log.fechaHora).toLocaleString()}</Text></View>
            <View><Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>Resultado</Text><Badge variant="success">Success</Badge></View>
            <View><Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>Actor</Text><Text style={{ fontSize: 14, fontWeight: '500', color: colors.hcText }}>{log.correo}</Text></View>
            <View><Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>Módulo</Text><Text style={{ fontSize: 14, fontWeight: '500', color: colors.hcText }}>{log.moduloAfectado}</Text></View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: colors.outline, paddingTop: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.onSurfaceVariant, marginBottom: 12 }}>Payload / Datos Afectados</Text>
            <View style={{ backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outline, borderRadius: radius.md, padding: 16 }}>
              <Text style={{ fontFamily: 'monospace', fontSize: 11, color: colors.onSurfaceVariant }}>
                {JSON.stringify({
                  id: log.id, accion: log.tipoAccion, modulo: log.moduloAfectado,
                  usuario: log.correo, fecha: log.fechaHora, detalle: log.detalle,
                }, null, 2)}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
