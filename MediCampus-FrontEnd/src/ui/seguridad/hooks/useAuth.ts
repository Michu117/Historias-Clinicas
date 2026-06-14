import { useMemo } from 'react'
import useSessionToken from './useSession'
import * as jwtUtils from '../utils/jwtUtils'

export function useAuth() {
  const { token } = useSessionToken()

  const claims = useMemo(() => {
    try {
      if (!token) return {}
      return jwtUtils.parseClaims(token) || {}
    } catch {
      return {}
    }
  }, [token])

  function isAuthenticated() {
    if (!token) return false
    return !jwtUtils.isExpired(token)
  }

  let storedUser: unknown = null
  try {
    const raw = localStorage.getItem('currentUser')
    if (raw) storedUser = JSON.parse(raw)
  } catch { /* noop */ }

  return { token, claims, isAuthenticated, storedUser }
}

export default useAuth
