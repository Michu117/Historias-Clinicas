import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, radius } from '../../../utils/theme';

interface ForbiddenScreenProps {
  navigation: any;
}

export function ForbiddenScreen({ navigation }: ForbiddenScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Card style={{ width: '100%', maxWidth: 400, alignItems: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: radius.full, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 32, color: colors.error }}>!</Text>
        </View>
        <Text style={{ fontSize: 48, fontWeight: '700', color: '#1e293b', marginBottom: 8 }}>403</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 8 }}>Acceso Denegado</Text>
        <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
          No tienes permisos para acceder a este módulo. Contacta al administrador del sistema si consideras que esto es un error.
        </Text>
        <Button variant="primary" onPress={() => navigation.navigate('SecurityDashboard')}>
          Volver al Dashboard
        </Button>
      </Card>
    </SafeAreaView>
  );
}
