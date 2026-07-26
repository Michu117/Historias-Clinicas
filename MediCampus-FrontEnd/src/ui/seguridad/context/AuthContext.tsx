import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import * as jwtUtils from '../utils/jwtUtils'
import { login as loginApi } from '../utils/authApi'

type User = {
  id?: number
  correo?: string
  nombre?: string
  roles?: Array<{ nombre: string }>
  esActiva?: boolean
}

type AuthContextType = {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (correo: string, clave: string) => Promise<User>
  logout: () => void
  loading: boolean
}

const STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
  user: 'currentUser',
}

function readFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    if (key === STORAGE_KEYS.token || key === STORAGE_KEYS.refreshToken) return raw as unknown as T
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => readFromStorage<string | null>(STORAGE_KEYS.token, null))
  const [refreshToken, setRefreshToken] = useState<string | null>(() => readFromStorage<string | null>(STORAGE_KEYS.refreshToken, null))
  const [user, setUser] = useState<User | null>(() => readFromStorage<User | null>(STORAGE_KEYS.user, null))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token && !jwtUtils.isExpired(token)
  const isAdmin = isAuthenticated && (user?.roles?.some(r => ['Administrador', 'administrador', 'admin'].includes(r.nombre)) ?? false)

  const login = useCallback(async (correo: string, clave: string): Promise<User> => {
    setLoading(true)
    try {
      const res = await loginApi({ correo, clave })
      const { access, refresh } = res.tokens
      const usuario = res.usuario as User

      setToken(access)
      setRefreshToken(refresh)
      setUser(usuario)

      try {
        localStorage.setItem(STORAGE_KEYS.token, access)
        localStorage.setItem(STORAGE_KEYS.refreshToken, refresh)
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(usuario))
      } catch { /* noop */ }

      return usuario
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEYS.token)
      localStorage.removeItem(STORAGE_KEYS.refreshToken)
      localStorage.removeItem(STORAGE_KEYS.user)
    } catch { /* noop */ }
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isAdmin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}

export default AuthContext
