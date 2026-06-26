import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card, CardTitle } from '../../components/Card';
import { colors, radius } from '../../../utils/theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!correo.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      // Llamada a API (pendiente de implementar en backend)
      // await forgotPassword({ correo: correo.trim() });
      await new Promise((r) => setTimeout(r, 1000));
      setSuccess('Si el correo existe en nuestros registros, recibirás un enlace para restablecer tu contraseña.');
    } catch (err: any) {
      setError(err?.message || 'Error al enviar el correo. Intenta de nuevo.');
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
            <CardTitle>Recuperar Contraseña</CardTitle>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' }}>
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
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

          {error ? (
            <View style={{ backgroundColor: colors.errorContainer, borderWidth: 1, borderColor: '#fecaca', borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.onErrorContainer, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={{ backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: '#166534', fontSize: 13 }}>{success}</Text>
            </View>
          ) : null}

          <Button variant="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>

          <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }} onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
