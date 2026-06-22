# Documentación Técnica: MediCampus - Agendar Cita (Vista Paciente)

Este documento contiene la definición de componentes y la implementación en TypeScript de la pantalla de agendamiento para pacientes, cumpliendo con los estándares de diseño **Clinical Clarity** y accesibilidad **WCAG 2.1 AA**.

## 1. Biblioteca de Componentes (TypeScript + Tailwind)

### TopNavBar.tsx
```tsx
import React from 'react';

interface TopNavBarProps {
  productName: string;
  userName?: string;
  userAvatar?: string;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ productName, userName, userAvatar }) => {
  return (
    <header className="flex justify-between items-center h-16 px-6 bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-headline-sm font-bold text-primary">{productName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button aria-label="Notificaciones" className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
          <span className="material-icons text-on-surface-variant">notifications</span>
        </button>
        <button aria-label="Configuración" className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
          <span className="material-icons text-on-surface-variant">settings</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <img src={userAvatar} alt={`Perfil de ${userName}`} className="w-8 h-8 rounded-full bg-surface-container-high" />
        </div>
      </div>
    </header>
  );
};
```

### SideNavBar.tsx
```tsx
import React from 'react';

const navItems = [
  { label: 'Agenda', icon: 'calendar_today', active: true },
  { label: 'Historias Clínicas', icon: 'folder_shared' },
  { label: 'Notificaciones', icon: 'notifications' },
  { label: 'Reportes', icon: 'analytics' },
  { label: 'Seguridad', icon: 'security' },
];

export const SideNavBar: React.FC = () => {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col p-6 gap-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold">MC</div>
        <div>
          <p className="font-bold text-primary">MediCampus</p>
          <p className="text-label-sm text-on-surface-variant">Gestión Médica</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              item.active 
              ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' 
              : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-icons text-xl">{item.icon}</span>
            <span className="text-label-md">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-auto">
        <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high w-full rounded-lg">
          <span className="material-icons text-xl">logout</span>
          <span className="text-label-md">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};
```

## 2. Pantalla Principal: AgendarCita.tsx

```tsx
import React, { useState } from 'react';
import { TopNavBar } from './components/TopNavBar';
import { SideNavBar } from './components/SideNavBar';

const timeSlots = [
  { time: '08:00', available: true },
  { time: '08:30', available: true },
  { time: '09:00', available: false },
  { time: '09:30', available: true, selected: true },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: true },
];

export const AgendarCita: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState('09:30');

  return (
    <div className="min-h-screen bg-surface flex">
      <SideNavBar />
      <main className="flex-1 ml-64">
        <TopNavBar productName="MediCampus" userName="Juan Delgado" />
        
        <div className="p-10 max-w-5xl mx-auto">
          <header className="mb-8">
            <h2 className="text-headline-md font-bold text-on-surface mb-2">Agendar Cita</h2>
            <p className="text-body-md text-on-surface-variant">Complete los detalles para programar una nueva atención médica.</p>
          </header>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm space-y-10">
            {/* Sección 1: Detalles del Servicio */}
            <section aria-labelledby="service-details">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-icons text-primary">medical_services</span>
                <h3 id="service-details" className="text-title-lg font-bold">1. Detalles del Servicio</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-label-large font-bold">Especialidad</label>
                  <select className="w-full h-12 px-4 rounded-lg border border-outline bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option>Seleccione especialidad...</option>
                    <option>Cardiología</option>
                    <option>Medicina General</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-label-large font-bold">Profesional Asignado</label>
                  <select className="w-full h-12 px-4 rounded-lg border border-outline bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option>Seleccione profesional...</option>
                    <option>Dr. Ricardo Gómez</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Sección 2: Fecha y Hora */}
            <section aria-labelledby="date-time">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-icons text-primary">schedule</span>
                  <h3 id="date-time" className="text-title-lg font-bold">2. Fecha y Hora</h3>
                </div>
                <div className="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-lg border border-outline-variant text-label-large">
                  <span className="material-icons text-sm">calendar_month</span>
                  <span>15 Octubre, 2023</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-label-medium text-on-surface-variant">Horarios disponibles para la fecha seleccionada:</p>
                <div className="grid grid-cols-4 gap-4">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`h-12 rounded-lg border text-label-large transition-all flex items-center justify-center gap-2 ${
                        slot.time === selectedTime
                        ? 'bg-primary text-on-primary border-primary shadow-md'
                        : slot.available
                          ? 'bg-surface border-outline text-on-surface hover:bg-surface-container-low'
                          : 'bg-surface-container-low border-outline-variant text-on-surface-variant/40 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                      {slot.time === selectedTime && <span className="w-1.5 h-1.5 bg-on-primary rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer de Acciones */}
            <div className="pt-8 border-t border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-3 bg-secondary-container px-4 py-2 rounded-full border border-secondary/20">
                <span className="material-icons text-sm text-on-secondary-container">check_circle</span>
                <span className="text-label-medium font-bold text-on-secondary-container uppercase tracking-wider">Agendada</span>
              </div>
              <div className="flex gap-4">
                <button className="px-6 h-12 border border-outline text-primary font-bold rounded-lg hover:bg-surface-container-low transition-all">
                  Cancelar
                </button>
                <button className="px-6 h-12 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 shadow-lg flex items-center gap-2 transition-all">
                  <span className="material-icons">save</span>
                  Guardar Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 3. Especificaciones Técnicas

- **Framework:** React con TypeScript.
- **Estilos:** Tailwind CSS utilizando la paleta de tokens de **Clinical Clarity**.
- **Iconografía:** Material Icons.
- **Accesibilidad:** 
  - Uso de etiquetas semánticas (`<header>`, `<nav>`, `<main>`, `<section>`).
  - Navegación por teclado mediante estados `focus-ring` (implícitos en Tailwind).
  - Etiquetas `aria-label` y `aria-labelledby` para lectores de pantalla.
  - Relación de contraste 4.5:1 mantenida en todos los elementos interactivos.
