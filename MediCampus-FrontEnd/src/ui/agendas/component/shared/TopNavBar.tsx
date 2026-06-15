import React from 'react';

interface TopNavBarProps {
  productName?: string;
  userName?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  productName = 'MediCampus',
  userName,
}) => {
  const displayName = userName || (() => {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.usuario?.nombre && u.usuario?.apellido) {
          return `${u.usuario.nombre} ${u.usuario.apellido}`;
        }
        return u.correo || 'Usuario';
      }
    } catch { /* noop */ }
    return 'Usuario';
  })();

  return (
    <header
      className="flex justify-between items-center h-16 px-6 border-b sticky top-0 z-50"
      style={{ backgroundColor: 'var(--surface, #ffffff)', borderColor: 'var(--outline-variant, #cbd5e1)' }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-black" style={{ color: 'var(--primary, #2563eb)' }}>{productName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          aria-label="Notificaciones"
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--on-surface-variant, #64748b)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-low, #f1f5f9)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <button
          aria-label="Configuración"
          className="p-2 rounded-full transition-colors"
          style={{ color: 'var(--on-surface-variant, #64748b)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-container-low, #f1f5f9)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--surface-container-high, #e2e8f0)', color: 'var(--on-surface-variant, #64748b)' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
