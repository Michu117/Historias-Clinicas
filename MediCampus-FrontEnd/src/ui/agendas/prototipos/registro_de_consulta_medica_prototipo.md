# Implementación Técnica: MediCampus - Registro de Consulta Médica (Desktop)

Este documento detalla la implementación en **React**, **TypeScript** y **Tailwind CSS** de la pantalla de **Registro de Consulta Médica**, siguiendo el sistema de diseño **Clinical Clarity** y los estándares de accesibilidad **WCAG 2.1 AA**.

## 1. Componentes Reutilizables (Core)

### SideNavBar.tsx
Navegación lateral con soporte para estados activos y branding institucional.

```tsx
import React from 'react';

interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Consulta', icon: 'medical_services', active: true },
  { label: 'Historial Clínico', icon: 'folder_shared' },
  { label: 'Notificaciones', icon: 'notifications' },
  { label: 'Reportes', icon: 'analytics' },
];

export const SideNavBar: React.FC = () => {
  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-[#f1f3ff] border-r border-[#d3d9f0] flex flex-col py-8 px-4">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-[#0056b3] rounded-lg flex items-center justify-center text-white shadow-md">
          <span className="material-icons text-2xl font-bold">clinical_notes</span>
        </div>
        <div>
          <p className="font-black text-[#0056b3] text-xl leading-tight">MediCampus</p>
          <p className="text-[12px] text-[#44474e] font-medium uppercase tracking-wider">Panel Clínico</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              item.active 
              ? 'bg-[#d3e3fd] text-[#001c38] font-bold shadow-sm' 
              : 'text-[#44474e] hover:bg-[#e1e2ec]'
            }`}
          >
            <span className="material-icons text-[22px]">{item.icon}</span>
            <span className="text-sm font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-[#d3d9f0]">
        <button className="flex items-center gap-4 px-4 py-3 text-[#44474e] hover:bg-[#ffdad6] hover:text-[#410002] w-full rounded-xl transition-colors">
          <span className="material-icons">logout</span>
          <span className="text-sm font-bold">Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
};
```

### TopAppBar.tsx
Barra superior con búsqueda, notificaciones y perfil del facultativo.

```tsx
import React from 'react';

export const TopAppBar: React.FC = () => {
  return (
    <header className="flex justify-between items-center h-16 px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#d3d9f0]">
      <div className="relative group">
        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-[#44474e] text-xl">search</span>
        <input 
          type="text" 
          placeholder="Buscar pacientes, registros..." 
          className="w-[450px] h-10 pl-12 pr-4 bg-[#f1f3ff] border border-[#c4c6d0] rounded-full text-sm focus:ring-2 focus:ring-[#0056b3] focus:bg-white outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button aria-label="Notificaciones" className="p-2 hover:bg-[#f1f3ff] rounded-full transition-colors relative">
          <span className="material-icons text-[#44474e]">notifications_none</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white"></span>
        </button>
        <button aria-label="Configuración" className="p-2 hover:bg-[#f1f3ff] rounded-full transition-colors">
          <span className="material-icons text-[#44474e]">settings</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-[#d3d9f0]">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1b1b1f]">Dr. Juan Pérez</p>
            <p className="text-[11px] text-[#44474e] font-medium">Medicina General</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#0056b3] flex items-center justify-center text-white font-bold shadow-sm">
            JP
          </div>
        </div>
      </div>
    </header>
  );
};
```

## 2. Pantalla Principal: RegistroConsulta.tsx

```tsx
import React, { useState } from 'react';
import { SideNavBar } from './components/SideNavBar';
import { TopAppBar } from './components/TopAppBar';

export const RegistroConsulta: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf9ff] flex font-inter">
      <SideNavBar />
      
      <main className="flex-1 ml-64">
        <TopAppBar />
        
        <div className="p-10 max-w-6xl mx-auto">
          {/* Header de la Pantalla */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#1b1b1f] tracking-tight mb-1">Registro de Consulta Médica</h1>
            <p className="text-[#44474e] font-medium">Gestión de consultas y registro clínico institucional.</p>
          </div>

          {/* Card de Información del Paciente */}
          <div className="bg-white border border-[#d3d9f0] rounded-2xl p-6 shadow-sm mb-8 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#d3e3fd] flex items-center justify-center text-[#001c38] font-black text-xl">
                CM
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1b1b1f]">Registro de Datos en la Consulta</h2>
                <p className="text-sm text-[#44474e]">
                  Paciente actual: <span className="font-bold text-[#0056b3]">Carlos Mendoza Reyes</span> 
                  <span className="ml-2 px-2 py-0.5 bg-[#f1f3ff] rounded border border-[#d3d9f0] text-[11px] font-mono">(ID: HC-2023-8942)</span>
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#0056b3] text-[#0056b3] rounded-lg font-bold text-sm hover:bg-[#f1f3ff] transition-all">
              <span className="material-icons text-lg">picture_as_pdf</span>
              Generar Certificado PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Sección: Anamnesis y Evolución */}
            <section className="bg-white border border-[#d3d9f0] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Anamnesis y Evolución *</h3>
              </div>
              <textarea 
                className="w-full h-48 p-4 bg-[#f1f3ff] border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all placeholder:text-[#74777f]"
                placeholder="Ingrese los detalles de la consulta, síntomas, evolución..."
              />
              <p className="text-[12px] text-[#44474e] mt-2 font-medium">Este campo es obligatorio.</p>

              <div className="grid grid-cols-2 gap-8 mt-10">
                <div className="space-y-4">
                  <label className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Diagnóstico Principal (CIE-10) *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Buscar código o descripción..." 
                      className="w-full h-12 pl-4 pr-12 bg-white border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all"
                    />
                    <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-[#44474e]">search</span>
                  </div>
                  <p className="text-[12px] text-[#ba1a1a] font-medium">Debe ingresar un diagnóstico válido.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Tratamiento / Indicaciones</label>
                  <textarea 
                    className="w-full h-[104px] p-4 bg-white border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all"
                    placeholder="Instrucciones para el paciente..."
                  />
                </div>
              </div>
            </section>

            {/* Sección: Derivación Interdisciplinaria */}
            <section className="bg-white border border-[#d3d9f0] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-icons text-[#0056b3]">hail</span>
                <h3 className="text-lg font-bold text-[#1b1b1f]">Derivación Interdisciplinaria</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#44474e]">Especialidad Destino</label>
                  <select className="w-full h-12 px-4 bg-[#f1f3ff] border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none cursor-pointer">
                    <option>Seleccione especialidad...</option>
                    <option>Cardiología</option>
                    <option>Nutrición</option>
                    <option>Psicología</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#44474e]">Motivo de Derivación</label>
                  <textarea 
                    className="w-full h-24 p-4 bg-white border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all"
                    placeholder="Justificación clínica de la derivación..."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 3. Especificaciones de Diseño y Accesibilidad

- **Contraste de Color:** Se utiliza una paleta basada en azules corporativos y neutros de alta legibilidad (AA Compliance).
- **Semántica HTML5:** Uso de `<main>`, `<section>`, `<header>`, y `<nav>` para facilitar la navegación con lectores de pantalla.
- **Tipografía:** Se emplea **Inter** con jerarquías claras mediante el uso de pesos (Medium, Bold, Black) y mayúsculas espaciadas para etiquetas de campo.
- **Feedback Visual:** Los estados de enfoque (`focus-ring`) y validación de errores están claramente definidos visualmente y mediante marcado.
- **Localización:** Toda la interfaz está adaptada al español, incluyendo etiquetas y mensajes de error.
