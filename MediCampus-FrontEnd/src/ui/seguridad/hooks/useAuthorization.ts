import { useMemo } from 'react'
import useAuth from './useAuth'

type Claims = { roles?: string[]; permissions?: string[] }
type StoredUser = { roles?: Array<{ nombre: string }>; esActiva?: boolean }

const ADMIN_ROLES = ['Administrador', 'administrador', 'admin']

export function useAuthorization() {
  const { token, claims: rawClaims, isAuthenticated, storedUser } = useAuth()

  const userRole = useMemo(() => {
    const u = storedUser as StoredUser | null
    return u?.roles?.[0]?.nombre || ''
  }, [storedUser])

  const claims: Claims = useMemo(() => {
    try {
      return (rawClaims as Claims) || {}
    } catch {
      return {}
    }
  }, [rawClaims])

  function canRender(permission: string) {
    if (!isAuthenticated()) return false
    const perms = claims.permissions || []
    const roles = claims.roles || []
    if (perms.includes(permission)) return true
    if (roles.includes('Administrador')) return true
    if (ADMIN_ROLES.includes(userRole)) return true
    return false
  }

  return { isAuthenticated, canRender, claims, token, userRole }
}

export default useAuthorization
