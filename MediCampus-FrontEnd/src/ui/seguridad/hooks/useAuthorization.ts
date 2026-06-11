import { useMemo } from 'react'
import useAuth from './useAuth'

type Claims = { roles?: string[]; permissions?: string[] }
<<<<<<< HEAD
type StoredUser = { rol?: { nombre: string } | null; esActiva?: boolean }

const ADMIN_ROLES = ['Administrador', 'administrador', 'admin']

export function useAuthorization() {
  const { token, claims: rawClaims, isAuthenticated, storedUser } = useAuth()

  const userRole = useMemo(() => {
    const u = storedUser as StoredUser | null
    return u?.rol?.nombre || ''
  }, [storedUser])
=======

export function useAuthorization() {
  const { token, claims: rawClaims, isAuthenticated } = useAuth()
>>>>>>> origin/feature/fabricio

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
<<<<<<< HEAD
    if (ADMIN_ROLES.includes(userRole)) return true
    return false
  }

  return { isAuthenticated, canRender, claims, token, userRole }
=======
    return false
  }

  return { isAuthenticated, canRender, claims, token }
>>>>>>> origin/feature/fabricio
}

export default useAuthorization
