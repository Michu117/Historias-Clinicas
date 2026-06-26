import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Card, CardTitle } from '../../components/Card';
import { register } from '../utils/authApi';
import { useAuthContext } from '../context/AuthContext';
import { colors, radius } from '../../../utils/theme';

const SEXO_OPTIONS = [
  { value: 'H', label: 'Hombre' },
  { value: 'M', label: 'Mujer' },
];

interface RegisterScreenProps {
  navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { login } = useAuthContext();
  const [form, setForm] = useState({
    correo: '', clave: '', confirmarClave: '',
    nombre: '', apellido: '', cedula: '',
    fechaNacimiento: '', sexo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: string) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const validatePassword = (pw: string): string[] => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(pw)) errors.push('Al menos una mayúscula');
    if (!/[a-z]/.test(pw)) errors.push('Al menos una minúscula');
    if (!/\d/.test(pw)) errors.push('Al menos un número');
    return errors;
  };

  const handleSubmit = async () => {
    setError('');
    setPasswordErrors([]);

    const pwErrors = validatePassword(form.clave);
    if (pwErrors.length > 0) { setPasswordErrors(pwErrors); return; }
    if (form.clave !== form.confirmarClave) { setError('Las contraseñas no coinciden.'); return; }

    setLoading(true);
    try {
      const res = await register({
        correo: form.correo, clave: form.clave,
        nombre: form.nombre, apellido: form.apellido,
        cedula: form.cedula, fechaNacimiento: form.fechaNacimiento,
        sexo: form.sexo,
      });
      await login(form.correo, form.clave);
    } catch (err: any) {
      setError(err?.message || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
        <Card style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ color: colors.onPrimary, fontSize: 20, fontWeight: '700' }}>M</Text>
            </View>
            <CardTitle>Crear Cuenta</CardTitle>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>Regístrate en el sistema de MediCampus</Text>
          </View>

          <Input label="Nombres" required placeholder="Ana" value={form.nombre} onChangeText={updateField('nombre')} />
          <Input label="Apellidos" required placeholder="Pérez" value={form.apellido} onChangeText={updateField('apellido')} />
          <Input label="Cédula" required placeholder="0102030405" value={form.cedula} onChangeText={(v) => updateField('cedula')(v.replace(/\D/g, '').slice(0, 10))} />
          <Input label="Correo electrónico" required placeholder="ana@example.com" value={form.correo} onChangeText={updateField('correo')} keyboardType="email-address" />

          <Input
            label="Contraseña" required placeholder="••••••••" value={form.clave} onChangeText={updateField('clave')}
            secureTextEntry={!showPassword}
            rightIcon={<Text style={{ fontSize: 18, color: colors.onSurfaceVariant }}>{showPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          {passwordErrors.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              {passwordErrors.map((msg, i) => (
                <Text key={i} style={{ fontSize: 12, color: colors.error }}>✗ {msg}</Text>
              ))}
            </View>
          )}

          <Input
            label="Confirmar contraseña" required placeholder="••••••••" value={form.confirmarClave} onChangeText={updateField('confirmarClave')}
            secureTextEntry={!showConfirmPassword}
            rightIcon={<Text style={{ fontSize: 18, color: colors.onSurfaceVariant }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <Input label="Fecha de nacimiento" required placeholder="YYYY-MM-DD" value={form.fechaNacimiento} onChangeText={updateField('fechaNacimiento')} />
          <Select label="Sexo" required options={SEXO_OPTIONS} value={form.sexo} onChange={updateField('sexo')} />

          {error ? (
            <View style={{ backgroundColor: colors.errorContainer, borderRadius: radius.md, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: colors.onErrorContainer, fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <Button variant="primary" onPress={handleSubmit} disabled={loading}>
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 13, color: colors.onSurfaceVariant }}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '500' }}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
