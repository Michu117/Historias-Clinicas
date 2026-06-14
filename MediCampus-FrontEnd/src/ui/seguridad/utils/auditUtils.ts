export type RawAuditLog = {
  id: string
  user: string
  date: string
  ip: string
  operation: string
  riskLevel: string
}

export function formatDateISO(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function normalizeRisk(level?: string) {
  if (!level) return 'low'
  const l = level.toLowerCase()
  if (l.includes('high')) return 'high'
  if (l.includes('medium') || l.includes('med')) return 'medium'
  return 'low'
}

export function transformRawLog(r: RawAuditLog) {
  return {
    id: r.id,
    user: r.user,
    date: r.date,
    ip: r.ip,
    operation: r.operation,
    riskLevel: normalizeRisk(r.riskLevel)
  }
}

export default { formatDateISO, normalizeRisk, transformRawLog }
