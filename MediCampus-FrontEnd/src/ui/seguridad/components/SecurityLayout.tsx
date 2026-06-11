import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from '../../components/Sidebar'
import { Topbar } from '../../components/Topbar'
import { Button } from '../../components/Button'
import { useSession } from '../hooks/useSession'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/seguridad/dashboard', icon: '📊' },
  { label: 'Usuarios', path: '/seguridad/users', icon: '👥' },
  { label: 'Permisos', path: '/seguridad/permissions', icon: '🔐' },
  { label: 'Auditoría', path: '/seguridad/audit', icon: '📋' },
  { label: 'Alertas', path: '/seguridad/alerts', icon: '🔔' },
] as const

const SecurityLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearSession } = useSession()
  const { isAuthenticated } = useAuth()

  const handleLogout = () => {
    clearSession()
    navigate('/seguridad/login')
  }

  const currentTitle = NAV_ITEMS.find((item) => location.pathname === item.path)?.label || 'Seguridad'

  return (
    <div className="flex h-screen bg-hc-bg">
      <Sidebar>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">MediCampus</h2>
          <p className="text-xs text-slate-400">Módulo de Seguridad</p>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-3 py-2 rounded-global text-sm transition-colors ${
                location.pathname === item.path
                  ? 'bg-hc-primary text-hc-primaryText font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-global text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </Sidebar>

      <div className="flex-1 flex flex-col ml-64">
        <Topbar title={currentTitle} />
        <main className="flex-1 p-6 mt-16 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SecurityLayout
