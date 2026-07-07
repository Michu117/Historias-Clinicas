import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card, CardTitle } from '../components/Card';
import { NotificationBell } from '../components/NotificationBell';
import { useAuthContext } from '../seguridad/context/AuthContext';
import { colors } from '../../utils/theme';

interface HomeScreenProps {
  navigation: any;
}

const PROFESSIONAL_ROLES = ['medico', 'odontologo', 'psicologo', 'trabajador_social', 'trabajo_social'];

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { user, logout } = useAuthContext();
  const userName = user?.correo ?? 'Usuario';
  const roleName = (user?.roles?.[0]?.nombre ?? '').toLowerCase();
  const isProfessional = PROFESSIONAL_ROLES.includes(roleName);

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>M</Text>
              </View>
              <Text style={{ fontWeight: '600', color: colors.onPrimary, fontSize: 17 }}>MediCampus</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <NotificationBell notifications={[]} isLoading={false} onMarkAsRead={() => {}} />
              <Text style={{ fontSize: 13, color: '#ffffffcc' }}>{userName}</Text>
              <Button variant="secondary" size="sm" onPress={handleLogout}>
                Cerrar Sesión
              </Button>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 24, maxWidth: 800, width: '100%', alignSelf: 'center' }}>
          <Card style={{ marginBottom: 24 }}>
            <CardTitle>Bienvenido a MediCampus</CardTitle>
            <Text style={{ marginTop: 8, color: colors.onSurfaceVariant, fontSize: 14 }}>
              Sistema de Bienestar Universitario de la Universidad Nacional de Loja.
            </Text>
          </Card>

          <View style={{ gap: 16 }}>
            <Card>
              <Text style={{ fontWeight: '600', color: colors.hcText, fontSize: 15 }}>Mis Citas Médicas</Text>
              <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Programa y consulta tus citas médicas.</Text>
              <Button variant="primary" style={{ marginTop: 12 }} onPress={() => {}}>
                Ir a Citas
              </Button>
            </Card>

            <Card>
              <Text style={{ fontWeight: '600', color: colors.hcText, fontSize: 15 }}>Mis Citas</Text>
              <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Revisa, reprograma o cancela tus citas agendadas.</Text>
              <Button variant="primary" style={{ marginTop: 12 }} onPress={() => {}}>
                Ver Mis Citas
              </Button>
            </Card>

            <Card>
              <Text style={{ fontWeight: '600', color: colors.hcText, fontSize: 15 }}>Mi Historia</Text>
              <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>
                Revisa los detalles de tu historia clinica.
              </Text>
              <Button variant="primary" style={{ marginTop: 12 }} onPress={() => {}}>
                Ver Mi Historia
              </Button>
            </Card>

            {isProfessional && (
              <Card>
                <Text style={{ fontWeight: '600', color: colors.hcText, fontSize: 15 }}>Administración de Citas</Text>
                <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>
                  Gestiona la agenda diaria de atención a pacientes.
                </Text>
                <Button variant="primary" style={{ marginTop: 12 }} onPress={() => {}}>
                  Ir a Mi Agenda
                </Button>
              </Card>
            )}
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingVertical: 16, marginTop: 32 }}>
          <Text style={{ textAlign: 'center', fontSize: 11, color: colors.onSurfaceVariant }}>
            Universidad Nacional de Loja &copy; {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
