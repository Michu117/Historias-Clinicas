import { useState, useEffect } from 'react'

export function useSessionToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    try {
      const t = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem('token') : null
      setToken(t)
    } catch {
      setToken(null)
    }
  }, [])

  function saveToken(t: string | null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (t) window.localStorage.setItem('token', t)
        else window.localStorage.removeItem('token')
      }
    } catch {
      // noop
    }
    setToken(t)
  }

  return { token, saveToken }
}

export default useSessionToken
