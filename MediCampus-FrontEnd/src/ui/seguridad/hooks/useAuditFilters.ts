import { useState, useMemo } from 'react'
import type { AuditLog } from './useAuditLogs'

export function useAuditFilters(initialUser = '', initialRisk = '') {
  const [filterUser, setFilterUser] = useState(initialUser)
  const [riskFilter, setRiskFilter] = useState(initialRisk)

  function clear() {
    setFilterUser('')
    setRiskFilter('')
  }

  const apply = (logs: AuditLog[]) => {
    return logs.filter((l) => {
      if (filterUser && !l.user.toLowerCase().includes(filterUser.toLowerCase())) return false
      if (riskFilter && l.riskLevel !== riskFilter) return false
      return true
    })
  }

  const controls = useMemo(() => ({ filterUser, setFilterUser, riskFilter, setRiskFilter, clear }), [filterUser, riskFilter])

  return { controls, apply }
}

export default useAuditFilters
