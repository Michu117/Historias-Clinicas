import { useState, useCallback } from 'react'

const STORAGE_KEY_TOKEN = 'token'
const STORAGE_KEY_REFRESH = 'refreshToken'
const STORAGE_KEY_USER = 'currentUser'

function readToken(): string | null {
  try {
    return typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem(STORAGE_KEY_TOKEN)
      : null
  } catch {
    return null
  }
}

export function useSessionToken() {
  const [token, setToken] = useState<string | null>(readToken)

  const saveToken = useCallback((t: string | null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (t) window.localStorage.setItem(STORAGE_KEY_TOKEN, t)
        else window.localStorage.removeItem(STORAGE_KEY_TOKEN)
      }
    } catch {
      // noop
    }
    setToken(t)
  }, [])

  return { token, saveToken }
}

function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_REFRESH)
  } catch {
    return null
  }
}

function readCurrentUser(): unknown | null {
  try {
    const cu = localStorage.getItem(STORAGE_KEY_USER)
    return cu ? JSON.parse(cu) : null
  } catch {
    return null
  }
}

export function useSession() {
  const { token, saveToken } = useSessionToken()
  const [refreshToken, setRefreshToken] = useState<string | null>(readRefreshToken)
  const [currentUser, setCurrentUser] = useState<unknown | null>(readCurrentUser)

  const saveSession = useCallback((access: string, refresh: string, user?: unknown) => {
    saveToken(access)
    setRefreshToken(refresh)
    if (user) {
      setCurrentUser(user)
      try { localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)) } catch { /* noop */ }
    }
    try { localStorage.setItem(STORAGE_KEY_REFRESH, refresh) } catch { /* noop */ }
  }, [saveToken])

  const clearSession = useCallback(() => {
    saveToken(null)
    setRefreshToken(null)
    setCurrentUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN)
      localStorage.removeItem(STORAGE_KEY_REFRESH)
      localStorage.removeItem(STORAGE_KEY_USER)
    } catch { /* noop */ }
  }, [saveToken])

  return { token, refreshToken, currentUser, saveSession, clearSession }
}

export default useSessionToken
