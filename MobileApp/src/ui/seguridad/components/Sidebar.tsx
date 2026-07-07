import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigationRef } from '../../../navigationRef';
import { useAuthContext } from '../context/AuthContext';
import { useSidebar } from './SidebarContext';
import { colors, radius } from '../../../utils/theme';

const SIDEBAR_WIDTH = 280;

type NavItem = {
  label: string;
  icon: string;
  screen: string;
};

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', screen: 'SecurityDashboard' },
  { label: 'Usuarios', icon: 'group', screen: 'UserManagement' },
  { label: 'Auditoría', icon: 'assignment', screen: 'AuditDashboard' },
  { label: 'Alertas', icon: 'notifications', screen: 'CriticalAlerts' },
  { label: 'Permisos', icon: 'lock', screen: 'PermissionAssignment' },
];

const USER_ITEMS: NavItem[] = [
  { label: 'Inicio', icon: 'home', screen: 'Home' },
];

const PATHS: Record<string, string> = {
  dashboard: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  group: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
  assignment: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  notifications: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

function SvgIcon({ name, size = 24, color }: { name: string; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={PATHS[name] || PATHS.home} />
    </Svg>
  );
}

export function Sidebar() {
  const { user, isAdmin, logout } = useAuthContext();
  const { open, close } = useSidebar();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) setVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: open ? 0 : -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !open) setVisible(false);
    });
  }, [open, slideAnim, fadeAnim]);

  const items = isAdmin ? ADMIN_ITEMS : USER_ITEMS;

  const handleNav = (screen: string) => {
    close();
    if (navigationRef.isReady()) {
      navigationRef.navigate(screen as never);
    }
  };

  const handleLogout = () => {
    close();
    logout();
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="auto">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={close} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: '100%',
          backgroundColor: colors.surfaceContainerLowest,
          transform: [{ translateX: slideAnim }],
          paddingTop: insets.top,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
        }}
      >
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: colors.onPrimary, fontSize: 18, fontWeight: '700' }}>MC</Text>
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.hcText }}>MediCampus</Text>
              <Text style={{ fontSize: 12, color: colors.onSurfaceVariant }}>Panel de Seguridad</Text>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 12 }}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.screen}
              onPress={() => handleNav(item.screen)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: radius.md,
                marginBottom: 2,
              }}
            >
              <SvgIcon name={item.icon} color={colors.onSurfaceVariant} />
              <Text style={{ fontSize: 14, fontWeight: '400', color: colors.onSurfaceVariant }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.outline, gap: 4 }}>
          <TouchableOpacity
            onPress={() => { close(); if (navigationRef.isReady()) navigationRef.navigate('Settings' as never); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md }}
          >
            <SvgIcon name="settings" color={colors.onSurfaceVariant} />
            <Text style={{ fontSize: 14, fontWeight: '400', color: colors.onSurfaceVariant }}>Configuración</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderRadius: radius.md }}
          >
            <SvgIcon name="logout" color={colors.primary} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.primary }}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
