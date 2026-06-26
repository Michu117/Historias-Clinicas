import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { colors } from '../../../utils/theme';

interface AuthGateScreenProps {
  navigation: any;
}

export function AuthGateScreen({ navigation }: AuthGateScreenProps) {
  const { user } = useAuthContext();
  const navigated = useRef(false);

  useEffect(() => {
    if (!user || navigated.current) return;
    navigated.current = true;

    console.log('[AuthGate] redirecting user:', JSON.stringify(user));

    if (user.mustChangePassword) {
      console.log('[AuthGate] target: CambiarClave');
      navigation.replace('CambiarClave');
      return;
    }

    const roleName = (user.roles?.[0]?.nombre ?? '').toLowerCase();
    const target = roleName === 'admin' || roleName === 'administrador'
      ? 'SecurityDashboard'
      : 'Home';
    console.log('[AuthGate] target:', target);
    navigation.replace(target);
  }, [user, navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
