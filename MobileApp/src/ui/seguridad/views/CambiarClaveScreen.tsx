import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card, CardTitle } from '../../components/Card';
import { changePassword } from '../utils/authApi';
import { colors, radius } from '../../../utils/theme';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

interface CambiarClaveScreenProps {
  navigation: any;
}

export function CambiarClaveScreen({ navigation }: CambiarClaveScreenProps) {
  const [clave, setClave] = useState('');
  const [confirmClave, setConfirmClave] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!PASSWORD_REGEX.test(clave)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    if (clave !== confirmClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ clave_nueva: clave });
      setSuccess('Contraseña actualizada correctamente. Redirigiendo...');
      setTimeout(() => navigation.replace('Home'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.onPrimary, fontSize: 20, fontWeight: '700' }}>M</Text>
            </View>
            <CardTitle>Cambiar Contraseña</CardTitle>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Debes cambiar tu contraseña antes de continuar.</Text>
          </View>

          <Input
            label="Nueva contraseña" required placeholder="••••••••"
            value={clave} onChangeText={setClave}
            secureTextEntry={!showPassword}
            rightIcon={<Text style={{ fontSize: 18, color: colors.onSurfaceVariant }}>{showPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          <Text style={{ fontSize: 12, color: colors.onSurfaceVariant, marginTop: -12, marginBottom: 16 }}>
            Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
          </Text>

          <Input
            label="Confirmar contraseña" required placeholder="••••••••"
            value={confirmClave} onChangeText={setConfirmClave}
            secureTextEntry={!showPassword}
          />

          {error ? (
            <View style={{ backgroundColor: colors.errorContainer, borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.onErrorContainer, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={{ backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: '#166534', fontSize: 13 }}>{success}</Text>
            </View>
          ) : null}

          <Button variant="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
