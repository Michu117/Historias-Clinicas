import { useMemo } from 'react'
import useAuth from './useAuth'

type Claims = { roles?: string[]; permissions?: string[] }

export function useAuthorization() {
  const { token, claims: rawClaims, isAuthenticated } = useAuth()

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
    return false
  }

  return { isAuthenticated, canRender, claims, token }
}

export default useAuthorization
