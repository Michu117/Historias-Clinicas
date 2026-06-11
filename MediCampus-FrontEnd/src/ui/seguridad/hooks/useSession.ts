<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_TOKEN = 'token'
const STORAGE_KEY_REFRESH = 'refreshToken'
const STORAGE_KEY_USER = 'currentUser'
=======
import { useState, useEffect } from 'react'
>>>>>>> origin/feature/fabricio

export function useSessionToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
<<<<<<< HEAD
      const t = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(STORAGE_KEY_TOKEN) : null
=======
      const t = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('token') : null
>>>>>>> origin/feature/fabricio
      setToken(t)
    } catch {
      setToken(null)
    }
  }, [])

<<<<<<< HEAD
  const saveToken = useCallback((t: string | null) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (t) window.localStorage.setItem(STORAGE_KEY_TOKEN, t)
        else window.localStorage.removeItem(STORAGE_KEY_TOKEN)
=======
  function saveToken(t: string | null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (t) window.localStorage.setItem('token', t)
        else window.localStorage.removeItem('token')
>>>>>>> origin/feature/fabricio
      }
    } catch {
      // noop
    }
    setToken(t)
<<<<<<< HEAD
  }, [])
=======
  }
>>>>>>> origin/feature/fabricio

  return { token, saveToken }
}

<<<<<<< HEAD
export function useSession() {
  const { token, saveToken } = useSessionToken()
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<unknown | null>(null)

  useEffect(() => {
    try {
      const rt = localStorage.getItem(STORAGE_KEY_REFRESH)
      setRefreshToken(rt)
      const cu = localStorage.getItem(STORAGE_KEY_USER)
      if (cu) setCurrentUser(JSON.parse(cu))
    } catch {
      // noop
    }
  }, [])

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

=======
>>>>>>> origin/feature/fabricio
export default useSessionToken
