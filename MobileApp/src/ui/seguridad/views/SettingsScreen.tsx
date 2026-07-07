import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card, CardTitle } from '../../components/Card';
import { getApiUrl, getApiUrlDebug, setApiUrl } from '../../../config';
import { colors } from '../../../utils/theme';

export function SettingsScreen() {
  const [url, setUrl] = useState(getApiUrl());
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUrl(getApiUrl());
  }, []);

  const sanitizeUrl = (u: string) => u.trim().replace(/,/g, '.');

  const handleSave = async () => {
    setSaving(true);
    setStatus('');
    try {
      const cleanUrl = sanitizeUrl(url);
      setUrl(cleanUrl);
      await setApiUrl(cleanUrl);
      setStatus('URL guardada correctamente.');
    } catch {
      setStatus('Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setStatus('Probando conexión...');
    try {
      const cleanUrl = sanitizeUrl(url);
      const res = await fetch(`${cleanUrl}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (res.ok || res.status === 400) {
        setStatus(`✓ Conexión exitosa (${res.status})`);
      } else {
        setStatus(`✗ Error ${res.status}: ${res.statusText}`);
      }
    } catch (e: any) {
      setStatus(`✗ No se pudo conectar: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
          <CardTitle>Configuración del Servidor</CardTitle>
          <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: 16 }}>
            Especifica la URL del servidor backend.
          </Text>

          <Input
            label="URL del servidor"
            placeholder="http://YOUR_SERVER_IP:8000"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Button variant="primary" onPress={handleSave} disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button variant="secondary" onPress={handleTest} style={{ flex: 1 }}>
              Probar
            </Button>
          </View>

          {status ? (
            <View style={{ backgroundColor: status.startsWith('✓') ? '#dcfce7' : status.startsWith('✗') ? '#fee2e2' : '#f0f0f0', borderRadius: 8, padding: 12, marginTop: 16 }}>
              <Text style={{ fontSize: 13, color: status.startsWith('✓') ? '#166534' : status.startsWith('✗') ? '#991b1b' : colors.hcText }}>{status}</Text>
            </View>
          ) : null}

          <Text style={{ fontSize: 10, color: colors.onSurfaceVariant, marginTop: 16, fontFamily: 'monospace' }}>
            {getApiUrlDebug()}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
