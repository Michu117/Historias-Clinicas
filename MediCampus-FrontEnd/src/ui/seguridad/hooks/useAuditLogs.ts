import { useEffect, useState, useCallback } from 'react'
import { fetchJSON } from '../utils/apiClient'
import useAuth from './useAuth'

export type AuditLog = {
  id: string
  user: string
  date: string
  ip: string
  operation: string
  riskLevel: 'low' | 'medium' | 'high' | string
}

const sampleLogs: AuditLog[] = [
  { id: 'a1', user: 'system', date: new Date().toISOString(), ip: '127.0.0.1', operation: 'LOGIN', riskLevel: 'low' },
  { id: 'a2', user: 'admin', date: new Date().toISOString(), ip: '10.0.0.2', operation: 'DELETE_USER', riskLevel: 'high' }
]

export function useAuditLogs() {
  const { token } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>(sampleLogs)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJSON('/api/audit-logs', token || undefined)
      if (Array.isArray(data)) {
        setLogs(data)
      }
    } catch (err: any) {
      // keep sample logs as fallback
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    // attempt to fetch but keep sample logs synchronously so UI is not empty
    void load()
  }, [load])

  return { logs, loading, error, refetch: load }
}

export default useAuditLogs
