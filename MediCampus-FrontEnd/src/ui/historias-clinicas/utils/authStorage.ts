import { useMemo } from 'react'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export interface AuthUser {
  id: string
  email?: string
  roles?: string[]
}

export class AuthStorage {
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  static clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  static getUser(): AuthUser | null {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static clearUser(): void {
    localStorage.removeItem(USER_KEY)
  }

  static hasToken(): boolean {
    return !!this.getToken()
  }

  static hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.roles?.includes(role) ?? false
  }

  static clear(): void {
    this.clearToken()
    this.clearUser()
  }
}

export const useAuthStorage = () => {
  const token = useMemo(() => AuthStorage.getToken(), [])
  const user = useMemo(() => AuthStorage.getUser(), [])
  const isAuthenticated = useMemo(() => AuthStorage.hasToken(), [])

  return {
    token,
    user,
    isAuthenticated,
    setToken: AuthStorage.setToken,
    setUser: AuthStorage.setUser,
    clearAuth: AuthStorage.clear,
    hasRole: AuthStorage.hasRole,
  }
}
