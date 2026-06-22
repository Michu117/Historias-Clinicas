import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/seguridad/dashboard', icon: 'dashboard' },
  { label: 'Usuarios', path: '/seguridad/users', icon: 'group' },
  { label: 'Permisos', path: '/seguridad/permissions', icon: 'manage_accounts' },
  { label: 'Auditoría', path: '/seguridad/audit', icon: 'assignment' },
  { label: 'Alertas', path: '/seguridad/alerts', icon: 'notifications' },
] as const

const SecurityLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearSession } = useSession()

  const handleLogout = () => {
    clearSession()
    navigate('/seguridad/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--hc-bg)' }}>

      {/* --- SIDENAVBAR --- */}
      <aside
        className="hidden md:flex flex-col h-screen w-[280px] p-6 space-y-2 shrink-0"
        style={{
          backgroundColor: 'var(--primary-container)',
          borderRight: '1px solid var(--outline)',
        }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: 'var(--primary)' }}>
            MC
          </div>
          <div>
            <h1 className="text-[20px] font-bold leading-tight" style={{ color: 'var(--on-primary-container)' }}>MediCampus</h1>
            <p className="text-[12px] font-semibold" style={{ color: 'var(--on-surface-variant)' }}>Módulo Seguridad</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive(item.path)
                  ? 'border-l-4'
                  : ''
              }`}
              style={{
                backgroundColor: isActive(item.path) ? 'var(--surface-container-high)' : 'transparent',
                color: isActive(item.path) ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                borderColor: isActive(item.path) ? 'var(--primary)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'; }}
              onMouseLeave={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="material-symbols-outlined" style={{ color: isActive(item.path) ? 'var(--primary)' : 'inherit' }}>{item.icon}</span>
              <span className="text-[14px] font-semibold">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-1" style={{ borderTop: '1px solid var(--outline)' }}>
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer"
            style={{ color: 'var(--on-surface-variant)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-container-low)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[14px] font-semibold">Cerrar Sesión</span>
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--hc-bg)' }}>
        <header
          className="h-16 flex items-center px-6 shrink-0"
          style={{
            backgroundColor: 'var(--surface-container-lowest)',
            borderBottom: '1px solid var(--outline)',
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>
            {NAV_ITEMS.find((i) => isActive(i.path))?.label || 'Seguridad'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default SecurityLayout
