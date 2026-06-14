/**
 * Punto de entrada principal del Módulo de Agendas
 * Stack: React 18 + Vite + Tailwind + Vitest
 * Nota: Las rutas se configurarán en la aplicación principal cuando react-router-dom esté disponible
 */

import React from 'react';
import { AgendarCita } from './component/pages/AgendarCita';
import { MiAgenda } from './component/pages/MiAgenda';
import { Derivaciones } from './component/pages/Derivaciones';

const getCurrentPath = () => window.location.pathname || '/';

export const AgendasApp: React.FC = () => {
  const currentPath = getCurrentPath();

  if (currentPath === '/agendas/mi-agenda') {
    return <MiAgenda />;
  }

  if (currentPath === '/agendas/derivaciones') {
    return <Derivaciones />;
  }

  if (currentPath === '/AgendarCita') {
    return (
      <div className="min-h-screen bg-gray-50" style={{ backgroundColor: 'var(--hc-bg, #f9fafb)' }}>
        <AgendarCita />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: 'var(--hc-bg, #f9fafb)' }}>
      <AgendarCita />
    </div>
  );
};

export default AgendasApp;
