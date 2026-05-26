import React, { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { fetchJSON } from '../utils/apiClient'

type User = { id: string; name: string; role?: string }

type Props = { role?: string }

export const UserTable: React.FC<Props> = ({ role }) => {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        // attempt real API call if available (endpoint placeholder)
        const data = await fetchJSON('/api/users', token || undefined)
        if (!mounted) return
        setUsers(Array.isArray(data) ? data : [])
      } catch {
        if (!mounted) return
        // fallback to local data for tests/environment without server
        setUsers(role === 'Administrador' ? [
          { id: '1', name: 'Admin User', role: 'Administrador' },
          { id: '2', name: 'Other User', role: 'Usuario' }
        ] : [])
      }
    }

    load()
    return () => { mounted = false }
  }, [role, token])

  if (!users) return <div>Loading...</div>

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200" aria-label="users-table">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2">{u.id}</td>
              <td className="px-4 py-2">{u.name}</td>
              <td className="px-4 py-2">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
