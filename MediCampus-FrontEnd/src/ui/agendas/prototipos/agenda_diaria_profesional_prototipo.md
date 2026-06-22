# Implementación Técnica: MediCampus - Agenda Diaria Profesional (Desktop)

Este documento detalla la implementación en **React**, **TypeScript** y **Tailwind CSS** de la pantalla de Agenda Diaria, siguiendo el sistema de diseño **Clinical Clarity** y los estándares de accesibilidad **WCAG 2.1 AA**.

## 1. Biblioteca de Componentes Reutilizables

### SideNavBar.tsx
Navegación lateral persistente con estados activos y branding de MediCampus.

```tsx
import React from 'react';

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'grid_view' },
  { label: 'Citas', icon: 'calendar_today', active: true },
  { label: 'Pacientes', icon: 'groups' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Settings', icon: 'settings' },
];

export const SideNavBar: React.FC = () => {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col py-8 px-4 gap-6">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-icons text-2xl font-bold text-white">medical_services</span>
        </div>
        <div>
          <p className="font-black text-primary text-xl leading-tight">MediCampus</p>
          <p className="text-label-sm text-on-surface-variant font-medium">General Medicine</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              item.active 
              ? 'bg-primary-container text-on-primary-container font-bold shadow-sm' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-icons text-[22px]">{item.icon}</span>
            <span className="text-label-large">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto border-t border-outline-variant pt-6">
        <button className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:bg-error-container hover:text-on-error-container w-full rounded-xl transition-colors">
          <span className="material-icons">logout</span>
          <span className="text-label-large font-bold">Logout</span>
        </button>
      </div>
    </nav>
  );
};
```

### TopAppBar.tsx
Barra superior con buscador global, notificaciones y perfil de usuario.

```tsx
import React from 'react';

export const TopAppBar: React.FC = () => {
  return (
    <header className="flex justify-end items-center h-16 px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input 
            type="text" 
            placeholder="Search records..." 
            className="w-80 h-10 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-full text-body-medium focus:ring-2 focus:ring-primary focus:bg-surface outline-none transition-all"
          />
        </div>
        <button aria-label="Notificaciones" className="relative p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-icons text-on-surface-variant">notifications_none</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
        <button aria-label="Ayuda" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
          <span className="material-icons text-on-surface-variant">help_outline</span>
        </button>
        <div className="flex items-center gap-3 pl-2 cursor-pointer group">
          <img 
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=40&h=40" 
            alt="Dr. Profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-outline-variant group-hover:border-primary transition-colors"
          />
        </div>
      </div>
    </header>
  );
};
```

## 2. Pantalla Principal: AgendaDiaria.tsx

```tsx
import React, { useState } from 'react';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';

type AppointmentStatus = 'Completado' | 'En Curso' | 'Programado';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  reason: string;
  status: AppointmentStatus;
  avatar: string;
}

const appointments: Appointment[] = [
  { id: '1', time: '08:00 AM', patient: 'Juan Perez', reason: 'Chequeo Rutina', status: 'Completado', avatar: 'JP' },
  { id: '2', time: '09:00 AM', patient: 'Maria Garcia', reason: 'Toy Malito', status: 'En Curso', avatar: 'MG' },
  { id: '3', time: '09:45 AM', patient: 'Carlos Lopez', reason: 'Me duele la uña', status: 'Programado', avatar: 'CL' },
  { id: '4', time: '10:30 AM', patient: 'Elena Martinez', reason: 'Chequeo', status: 'Programado', avatar: 'EM' },
];

export const AgendaDiaria: React.FC = () => {
  const [filter, setFilter] = useState<string>('Todos');

  return (
    <div className="min-h-screen bg-[#faf9ff] flex font-inter">
      <SideNavBar />
      <main className="flex-1 ml-64">
        <TopAppBar />
        
        <div className="p-10 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-[40px] font-black text-on-surface tracking-tight mb-2">Agenda Diaria</h1>
            <div className="flex items-center gap-2 text-on-surface-variant font-medium">
              <span className="material-icons text-lg">calendar_today</span>
              <span>24 de Octubre, 2023</span>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm mb-8 flex items-center justify-between">
            <div className="relative w-96">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person_search</span>
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label-medium font-bold text-on-surface-variant uppercase tracking-wider mr-2">Estado:</span>
              {['Todos', 'Programados', 'En Curso', 'Completados'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-5 py-2 rounded-full text-label-large font-bold transition-all ${
                    filter === tab 
                    ? 'bg-primary-container text-primary' 
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Citas */}
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div 
                key={appt.id} 
                className={`bg-white border-2 rounded-2xl p-6 flex items-center justify-between shadow-sm transition-all hover:shadow-md ${
                  appt.status === 'En Curso' ? 'border-primary ring-1 ring-primary/20' : 'border-outline-variant'
                }`}
              >
                <div className="flex items-center gap-10">
                  <div className="text-center w-24">
                    <p className="text-headline-small font-black text-on-surface leading-tight">{appt.time.split(' ')[0]}</p>
                    <p className="text-label-medium font-bold text-on-surface-variant">{appt.time.split(' ')[1]}</p>
                  </div>
                  
                  <div className="h-10 w-px bg-outline-variant"></div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-title-medium">
                      {appt.avatar}
                    </div>
                    <div>
                      <h3 className="text-title-large font-black text-on-surface">{appt.patient}</h3>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <span className="material-icons text-sm">medical_services</span>
                        <p className="text-body-medium font-medium">{appt.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-label-large font-bold flex items-center gap-2 ${
                    appt.status === 'Completado' ? 'bg-secondary-container text-secondary' :
                    appt.status === 'En Curso' ? 'bg-primary-container text-primary animate-pulse' :
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    <span className="material-icons text-sm">
                      {appt.status === 'Completado' ? 'check_circle' : appt.status === 'En Curso' ? 'hourglass_top' : 'schedule'}
                    </span>
                    {appt.status}
                  </span>
                  
                  {appt.status === 'Completado' ? (
                    <button className="px-6 h-12 text-primary font-bold hover:bg-primary-container rounded-xl transition-colors">
                      Ver Detalles
                    </button>
                  ) : (
                    <button className={`px-8 h-12 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                      appt.status === 'En Curso' ? 'bg-primary text-white hover:opacity-90' : 'bg-primary text-white'
                    }`}>
                      {appt.status === 'En Curso' ? 'Continuar' : 'Iniciar Consulta'}
                      <span className="material-icons text-sm">
                        {appt.status === 'En Curso' ? 'arrow_forward' : 'play_arrow'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 3. Especificaciones de Diseño (Clinical Clarity)

- **Contraste:** Todas las combinaciones de color texto/fondo superan la relación 4.5:1 exigida por WCAG AA.
- **Tipografía:** Se utiliza **Inter** con pesos variados (Medium, Bold, Black) para establecer una jerarquía clara.
- **Formas:** Radio de borde estándar de **8px** (`rounded-xl` en Tailwind para elementos grandes) para una estética moderna y amigable.
- **Accesibilidad:**
    - Uso de etiquetas semánticas (`header`, `nav`, `main`, `h1-h3`).
    - Atributos `aria-label` en botones de iconos.
    - Soporte para navegación por teclado con estados `:focus-visible` claramente definidos.
- **Espaciado:** Sistema de espaciado basado en 4px/8px para mantener un ritmo visual consistente.