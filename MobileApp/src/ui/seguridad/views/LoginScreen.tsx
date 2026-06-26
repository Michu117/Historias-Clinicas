import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card, CardTitle } from '../../components/Card';
import { useAuthContext } from '../context/AuthContext';
import { colors, radius } from '../../../utils/theme';

interface LoginScreenProps {
  navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuthContext();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(correo, clave);
      // Navigation is handled by AuthGate in AppNavigator
    } catch (err: any) {
      if (err?.status === 400) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else {
        setError(err?.message || 'Error al iniciar sesión. Intenta de nuevo.');
      }
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
            <CardTitle>Iniciar Sesión</CardTitle>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Accede al panel de seguridad de MediCampus</Text>
          </View>

          <Input
            label="Correo electrónico"
            required
            placeholder="tu@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoFocus
          />

          <Input
            label="Contraseña"
            required
            placeholder="••••••••"
            value={clave}
            onChangeText={setClave}
            secureTextEntry={!showPassword}
            rightIcon={
              <Text style={{ fontSize: 18, color: colors.onSurfaceVariant }}>
                {showPassword ? '🙈' : '👁️'}
              </Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {error ? (
            <View style={{ backgroundColor: colors.errorContainer, borderWidth: 1, borderColor: '#fecaca', borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.onErrorContainer, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <Button variant="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant }}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
