export async function fetchJSON(url: string, token?: string) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err: any = new Error(res.statusText || 'Fetch error')
    err.status = res.status
    err.body = body
    throw err
  }
  return res.json()
}

export default { fetchJSON }
