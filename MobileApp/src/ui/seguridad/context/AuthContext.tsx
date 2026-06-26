import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi } from '../utils/authApi';
import { isExpired } from '../utils/jwtUtils';
import type { User } from '../../../types';

type AuthUser = {
  id?: number;
  correo?: string;
  nombre?: string;
  roles?: Array<{ nombre: string }>;
  esActiva?: boolean;
  mustChangePassword?: boolean;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (correo: string, clave: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
};

const STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
  user: 'currentUser',
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.user),
        ]);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch {
        // noop
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAuthenticated = !loading && !!token && !isExpired(token);
  const isAdmin = isAuthenticated && (user?.roles?.some(r => ['Administrador', 'administrador', 'admin'].includes(r.nombre)) ?? false);

  const login = useCallback(async (correo: string, clave: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await loginApi({ correo, clave });
      const { access, refresh } = res.tokens;
      const usuario = res.usuario as AuthUser;

      console.log('[AuthContext] login success, user:', JSON.stringify(usuario));
      console.log('[AuthContext] roles:', JSON.stringify(usuario.roles));

      setToken(access);
      setUser(usuario);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.token, access),
        AsyncStorage.setItem(STORAGE_KEYS.refreshToken, refresh),
        AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(usuario)),
      ]);

      return res.usuario;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.refreshToken, STORAGE_KEYS.user]);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
