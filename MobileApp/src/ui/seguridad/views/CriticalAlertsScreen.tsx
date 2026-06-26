import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { exportAuditLogs } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';

interface Incident {
  time: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

const INCIDENTS: Incident[] = [
  { time: '10:42 AM', title: 'Intento de Acceso Crítico', description: 'Intento no autorizado de acceder a la base de datos de Pacientes desde IP desconocida 192.168.1.104 (ID: SYS_UNKNOWN)', severity: 'critical' },
  { time: '09:15 AM', title: 'Escalada de Privilegios', description: "El usuario 'dr.smith' elevó su rol a Administrador fuera de la ventana de mantenimiento programada", severity: 'warning' },
  { time: '08:02 AM', title: 'Exportación Masiva de Datos', description: 'Exportación masiva de registros de facturación iniciada por un servicio de fondo no reconocido', severity: 'warning' },
];

interface CriticalAlertsScreenProps {
  navigation: any;
}

export function CriticalAlertsScreen({}: CriticalAlertsScreenProps) {
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportForm, setExportForm] = useState({ startDate: '', endDate: '' });

  const severityVariant = (s: Incident['severity']): 'danger' | 'warning' | 'neutral' => {
    if (s === 'critical') return 'danger';
    if (s === 'warning') return 'warning';
    return 'neutral';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.hcText }}>Alertas Críticas</Text>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>Monitoreo en tiempo real de eventos de alto riesgo</Text>
          </View>
          <Button variant="danger" onPress={() => setShowExport(true)}>Exportar Logs</Button>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' }} />
                  <CardTitle>Amenazas Activas</CardTitle>
                </View>
                <Text style={{ fontSize: 28, fontWeight: '700', color: '#dc2626' }}>{INCIDENTS.filter(i => i.severity === 'critical').length}</Text>
                <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Requieren revisión inmediata</Text>
              </Card>
            </View>
            <View style={{ flex: 1 }}>
              <Card>
                <CardTitle>Integridad del Sistema</CardTitle>
                <View style={{ marginTop: 12 }}>
                  <Badge variant="success">Solo Lectura</Badge>
                  <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 8 }}>Todos los logs son inmutables.</Text>
                </View>
              </Card>
            </View>
          </View>

          <Card>
            <CardTitle style={{ marginBottom: 16 }}>Línea de Tiempo de Incidentes</CardTitle>
            <View style={{ gap: 16 }}>
              {INCIDENTS.map((incident, idx) => (
                <View key={idx} style={{ paddingLeft: 24, borderLeftWidth: 2, borderLeftColor: colors.outline }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <View style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: incident.severity === 'critical' ? '#ef4444' : incident.severity === 'warning' ? '#eab308' : '#94a3b8',
                      position: 'absolute', left: -25, top: 4,
                    }} />
                    <Text style={{ fontSize: 11, color: colors.onSurfaceVariant }}>{incident.time}</Text>
                    <Badge variant={severityVariant(incident.severity)}>
                      {incident.severity === 'critical' ? 'Crítico' : incident.severity === 'warning' ? 'Advertencia' : 'Info'}
                    </Badge>
                  </View>
                  <Text style={{ fontWeight: '500', color: colors.hcText, fontSize: 14 }}>{incident.title}</Text>
                  <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>{incident.description}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <Modal visible={showExport} onClose={() => setShowExport(false)} title="Exportar Logs de Auditoría">
          <View style={{ backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#166534', fontSize: 13 }}>Los logs exportados están firmados criptográficamente para cumplimiento de solo lectura.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}><Input placeholder="Fecha inicio" value={exportForm.startDate} onChangeText={(v) => setExportForm(p => ({ ...p, startDate: v }))} /></View>
            <View style={{ flex: 1 }}><Input placeholder="Fecha fin" value={exportForm.endDate} onChangeText={(v) => setExportForm(p => ({ ...p, endDate: v }))} /></View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button variant="secondary" onPress={() => setShowExport(false)}>Cancelar</Button>
            <Button variant="primary" onPress={async () => { setExporting(true); await exportAuditLogs({ fecha_desde: exportForm.startDate || undefined, fecha_hasta: exportForm.endDate || undefined, formato: 'csv' }); setExporting(false); setShowExport(false); }} disabled={exporting}>CSV</Button>
            <Button variant="primary" onPress={async () => { setExporting(true); await exportAuditLogs({ fecha_desde: exportForm.startDate || undefined, fecha_hasta: exportForm.endDate || undefined, formato: 'pdf' }); setExporting(false); setShowExport(false); }} disabled={exporting}>PDF</Button>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
