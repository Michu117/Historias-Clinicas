import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { HamburgerMenuDropdown } from '../../components/HamburgerMenuDropdown'
import type { NavItem } from '../../components/HamburgerMenuDropdown'

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/seguridad/dashboard', match: '/seguridad/dashboard' },
  { label: 'Usuarios', icon: 'group', path: '/seguridad/users', match: '/seguridad/users' },
  { label: 'Auditoría', icon: 'assignment', path: '/seguridad/audit', match: '/seguridad/audit' },
  { label: 'Alertas', icon: 'notifications', path: '/seguridad/alerts', match: '/seguridad/alerts' },
  { label: 'Reportes', icon: 'reportes', path: '/reportes', match: '/reportes' },
] as const

const SecurityLayout: React.FC = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header
        className="h-16 flex items-center gap-3 px-6 shrink-0"
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          borderBottom: '1px solid var(--outline)',
        }}
      >
        <HamburgerMenuDropdown navItems={NAV_ITEMS} />
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
  )
}

export default SecurityLayout
