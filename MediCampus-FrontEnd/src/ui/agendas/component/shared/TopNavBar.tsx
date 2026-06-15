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
      style={{ backgroundColor: '#ffffff', borderColor: '#c2c6d4' }}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-black" style={{ color: '#003f87' }}>{productName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: '#d7e2ff', color: '#001a40' }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
