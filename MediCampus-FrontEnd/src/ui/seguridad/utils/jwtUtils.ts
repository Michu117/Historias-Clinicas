export function getToken(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('token')
    }
  } catch {
    // noop
  }
  return null
}

export function isExpired(token?: string | null): boolean {
  // minimal: treat missing token as expired
  if (!token) return true
  return false
}

export function parseClaims(token: string): any {
  // Very small parser attempt: try to read middle part of JWT
  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const payload = parts[1]
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(json)
    }
  } catch {
    // fallthrough
  }
  return {}
}

export default { getToken, isExpired, parseClaims }
