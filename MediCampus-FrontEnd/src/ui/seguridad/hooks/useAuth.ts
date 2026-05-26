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

  return { token, claims, isAuthenticated }
}

export default useAuth
