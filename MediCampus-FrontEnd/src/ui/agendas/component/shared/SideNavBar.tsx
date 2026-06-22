import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  match: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/home', match: '/home' },
  { label: 'Citas', icon: 'calendar', path: '/agendas/mi-agenda', match: '/agendas/mi-agenda' },
  { label: 'Pacientes', icon: 'patients', path: '/agendas/mi-agenda', match: '/agendas/pacientes' },
  { label: 'Derivaciones', icon: 'referral', path: '/agendas/derivaciones', match: '/agendas/derivaciones' },
  { label: 'Certificados', icon: 'certificate', path: '/agendas/certificados', match: '/agendas/certificados' },
  { label: 'Historias Clinicas', icon: 'certificate', path: '/historias', match: '/historias' },
];

export const SideNavBar: React.FC = () => {
  const navigate = useNavigate();

  const isActive = (match: string) => window.location.pathname.startsWith(match);

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <nav
      className="fixed left-0 top-0 h-full w-60 flex flex-col p-5 gap-5 z-40"
      style={{ backgroundColor: 'var(--surface-container-low)' }}
    >
      <div className="flex items-center gap-3 mb-3 px-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: 'var(--on-primary-container)' }}
        >
          MC
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--on-primary-container)' }}>MediCampus</p>
          <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Gesti&oacute;n M&eacute;dica</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.match);
          return (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active ? 'font-bold' : ''
              }`}
              style={
                active
                  ? { backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', borderLeft: '3px solid var(--on-primary-container)' }
                  : { color: 'var(--on-surface-variant)', backgroundColor: 'transparent' }
              }
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--btn-tertiary-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {renderIcon(item.icon)}
              </svg>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/'; }}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm transition-all shadow-none outline-none ring-0"
          style={{ color: 'var(--primary)', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--btn-tertiary-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Cerrar Sesi&oacute;n</span>
        </button>
      </div>
    </nav>
  );
};

function renderIcon(icon: string): React.ReactNode {
  switch (icon) {
    case 'dashboard':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
    case 'calendar':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />;
    case 'patients':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
    case 'referral':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />;
    case 'certificate':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />;
    default:
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
  }
}
