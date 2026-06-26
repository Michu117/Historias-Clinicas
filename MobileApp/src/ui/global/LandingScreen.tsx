import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { colors, radius } from '../../utils/theme';

interface LandingScreenProps {
  navigation: any;
}

export function LandingScreen({ navigation }: LandingScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 16 }}>M</Text>
              </View>
              <Text style={{ fontWeight: '600', color: colors.onPrimary, fontSize: 17 }}>MediCampus</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ padding: 4 }}>
                <Text style={{ fontSize: 20, color: colors.onPrimary }}>⚙️</Text>
              </TouchableOpacity>
              <Button variant="secondary" size="sm" onPress={() => navigation.navigate('Login')}>
                Iniciar Sesión
              </Button>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={{
                  paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.md,
                  backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: '500' }}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60 }}>
          <View style={{ width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: colors.onPrimary, fontSize: 24, fontWeight: '700' }}>M</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.hcText, textAlign: 'center', marginBottom: 16 }}>
            Bienestar Universitario
          </Text>
          <Text style={{ fontSize: 15, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 }}>
            Sistema integral de Bienestar Universitario de la Universidad Nacional de Loja. Gestiona citas médicas, permisos, exámenes y más.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button variant="primary" size="lg" onPress={() => navigation.navigate('Login')}>
              Iniciar Sesión
            </Button>
            <Button variant="secondary" size="lg" onPress={() => navigation.navigate('Register')}>
              Crear Cuenta
            </Button>
          </View>
        </View>

        <View style={{ paddingHorizontal: 32, paddingVertical: 48, gap: 32 }}>
          {[
            { title: 'Citas Médicas', desc: 'Programa y gestiona tus citas en línea.', color: colors.primaryContainer },
            { title: 'Resultados', desc: 'Consulta resultados de exámenes médicos.', color: colors.secondaryContainer },
            { title: 'Permisos', desc: 'Solicita permisos médicos en línea.', color: colors.primaryContainer },
          ].map((item, i) => (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: item.color, justifyContent: 'center', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 24, height: 24, backgroundColor: colors.onSurfaceVariant, borderRadius: 4, opacity: 0.3 }} />
              </View>
              <Text style={{ fontWeight: '600', color: colors.hcText, marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center' }}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingVertical: 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 11, color: colors.onSurfaceVariant }}>
            Universidad Nacional de Loja &copy; {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
