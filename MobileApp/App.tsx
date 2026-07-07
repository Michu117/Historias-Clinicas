import './src/theme/global.css';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, TouchableOpacity, View, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuthContext } from './src/ui/seguridad/context/AuthContext';
import { SidebarProvider, useSidebar } from './src/ui/seguridad/components/SidebarContext';
import { Sidebar } from './src/ui/seguridad/components/Sidebar';
import { LandingScreen } from './src/ui/global/LandingScreen';
import { HomeScreen } from './src/ui/global/HomeScreen';
import { LoginScreen } from './src/ui/seguridad/views/LoginScreen';
import { RegisterScreen } from './src/ui/seguridad/views/RegisterScreen';
import { ForgotPasswordScreen } from './src/ui/seguridad/views/ForgotPasswordScreen';
import { SettingsScreen } from './src/ui/seguridad/views/SettingsScreen';
import { CambiarClaveScreen } from './src/ui/seguridad/views/CambiarClaveScreen';
import { ForbiddenScreen } from './src/ui/seguridad/views/ForbiddenScreen';
import { SecurityDashboardScreen } from './src/ui/seguridad/views/SecurityDashboardScreen';
import { UserManagementScreen } from './src/ui/seguridad/views/UserManagementScreen';
import { AuditDashboardScreen } from './src/ui/seguridad/views/AuditDashboardScreen';
import { AuditLogDetailScreen } from './src/ui/seguridad/views/AuditLogDetailScreen';
import { CriticalAlertsScreen } from './src/ui/seguridad/views/CriticalAlertsScreen';
import { PermissionAssignmentScreen } from './src/ui/seguridad/views/PermissionAssignmentScreen';
import { navigationRef } from './src/navigationRef';
import { loadSavedApiUrl } from './src/config';
import { colors } from './src/utils/theme';

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Settings: undefined;
  Home: undefined;
  CambiarClave: undefined;
  Forbidden: undefined;
  SecurityDashboard: undefined;
  UserManagement: undefined;
  AuditDashboard: undefined;
  AuditLogDetail: { logId: string };
  CriticalAlerts: undefined;
  PermissionAssignment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HamburgerButton() {
  const { toggle } = useSidebar();
  return (
    <TouchableOpacity onPress={toggle} style={{ padding: 4, marginRight: 8 }}>
      <Text style={{ fontSize: 24, color: colors.hcText }}>☰</Text>
    </TouchableOpacity>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  const { user } = useAuthContext();
  const roleName = (user?.roles?.[0]?.nombre ?? '').toLowerCase();
  const isAdmin = roleName === 'admin' || roleName === 'administrador';

  const initialRoute: keyof RootStackParamList = user?.mustChangePassword
    ? 'CambiarClave'
    : isAdmin
    ? 'SecurityDashboard'
    : 'Home';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerStyle: { backgroundColor: colors.surfaceContainerLowest }, headerTintColor: colors.hcText }}>
      <Stack.Screen
        name="SecurityDashboard"
        component={SecurityDashboardScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Panel de Seguridad' }}
      />
      <Stack.Screen
        name="UserManagement"
        component={UserManagementScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Usuarios y Roles' }}
      />
      <Stack.Screen
        name="AuditDashboard"
        component={AuditDashboardScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Auditoría' }}
      />
      <Stack.Screen
        name="CriticalAlerts"
        component={CriticalAlertsScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Alertas Críticas' }}
      />
      <Stack.Screen
        name="PermissionAssignment"
        component={PermissionAssignmentScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Asignación de Permisos' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CambiarClave"
        component={CambiarClaveScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Forbidden"
        component={ForbiddenScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Acceso Denegado' }}
      />
      <Stack.Screen
        name="AuditLogDetail"
        component={AuditLogDetailScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Detalle de Auditoría' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerLeft: () => <HamburgerButton />, title: 'Configuración' }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading } = useAuthContext();

  useEffect(() => { loadSavedApiUrl(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  return (
    <View style={{ flex: 1 }}>
      <MainStack />
      <Sidebar />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SidebarProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </SidebarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
