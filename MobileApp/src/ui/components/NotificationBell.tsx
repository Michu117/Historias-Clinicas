import { useState } from 'react';
import { TouchableOpacity, View, Text, Modal, FlatList } from 'react-native';
import { colors, radius } from '../../utils/theme';

interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  error?: string;
}

export function NotificationBell({ notifications, isLoading, onMarkAsRead, error }: NotificationBellProps) {
  const [visible, setVisible] = useState(false);
  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={{ position: 'relative', padding: 4 }}>
        <Text style={{ fontSize: 20, color: '#ffffffcc' }}>🔔</Text>
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute', top: 0, right: 0,
            backgroundColor: colors.error, borderRadius: radius.full,
            width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 10, color: '#fff', fontWeight: '700' }}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surfaceContainerLowest, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, maxHeight: '60%' }}>
            <View style={{ width: 40, height: 4, backgroundColor: colors.outlineVariant, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.hcText, marginBottom: 12 }}>Notificaciones</Text>

            {isLoading && <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>Cargando...</Text>}
            {error && <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>}

            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onMarkAsRead(item.id)}
                  style={{
                    padding: 12, marginBottom: 8, borderRadius: radius.md,
                    backgroundColor: item.leida ? 'transparent' : colors.surfaceContainerLow,
                  }}
                >
                  <Text style={{ fontWeight: item.leida ? '400' : '600', color: colors.hcText }}>{item.titulo}</Text>
                  <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>{item.mensaje}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: colors.onSurfaceVariant, textAlign: 'center', padding: 20 }}>Sin notificaciones</Text>}
            />

            <TouchableOpacity onPress={() => setVisible(false)} style={{ alignSelf: 'center', marginTop: 12 }}>
              <Text style={{ color: colors.primary, fontWeight: '500' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
