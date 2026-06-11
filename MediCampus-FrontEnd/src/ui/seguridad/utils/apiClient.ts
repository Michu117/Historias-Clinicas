<<<<<<< HEAD
export async function fetchJSON(url: string, token?: string, options?: RequestInit) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers: { ...headers, ...options?.headers as Record<string, string> } })
=======
export async function fetchJSON(url: string, token?: string) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { headers })
>>>>>>> origin/feature/fabricio
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err: any = new Error(res.statusText || 'Fetch error')
    err.status = res.status
    err.body = body
    throw err
  }
<<<<<<< HEAD
  if (res.status === 204) return undefined
  return res.json()
}
=======
  return res.json()
}

export default { fetchJSON }
>>>>>>> origin/feature/fabricio
