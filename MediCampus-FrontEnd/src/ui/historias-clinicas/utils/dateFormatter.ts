export const toISODate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const normalizarFecha = (f: string | undefined | null): string => {
  if (!f) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(f)) return f
  const ddmm = f.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (ddmm) return `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}`
  const yyyyddmm = f.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  if (yyyyddmm) return `${yyyyddmm[1]}-${yyyyddmm[2]}-${yyyyddmm[3]}`
  const parsed = new Date(f)
  if (!isNaN(parsed.getTime())) return toISODate(parsed)
  return f
}
