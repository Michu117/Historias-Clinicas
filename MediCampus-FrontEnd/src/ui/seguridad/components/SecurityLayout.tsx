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
    <div className="flex h-screen bg-[#faf9ff] font-['Inter']">

      {/* --- SIDENAVBAR --- */}
      <aside className="hidden md:flex flex-col h-screen w-[280px] p-6 space-y-2 bg-[#f1f3ff] border-r border-[#c2c6d4] shrink-0">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#003f87] flex items-center justify-center text-white font-bold">MC</div>
          <div>
            <h1 className="text-[20px] font-bold text-[#003f87] leading-tight">MediCampus</h1>
            <p className="text-[12px] font-semibold text-[#424752]">Módulo Seguridad</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                isActive(item.path)
                  ? 'bg-[#d7e2ff] text-[#001a40] border-l-4 border-[#003f87]'
                  : 'text-[#424752] hover:bg-[#e1e8fe]'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive(item.path) ? 'text-[#003f87]' : ''}`}>{item.icon}</span>
              <span className="text-[14px] font-semibold">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#c2c6d4] space-y-1">
          <a
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#424752] hover:bg-[#e1e8fe] transition-all duration-200 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[14px] font-semibold">Cerrar Sesión</span>
          </a>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#faf9ff]">
        <header className="h-16 bg-white flex items-center px-6 border-b border-[#c2c6d4] shrink-0">
          <h2 className="text-lg font-semibold text-[#141b2b]">
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
