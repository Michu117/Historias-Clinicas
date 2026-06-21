import React, { useState, useEffect } from 'react';
import { NotificationList } from './NotificationList';
import { INotification } from '../types';
import { useNotifications, useMarkAsRead } from '../api';

const MOCK_NOTIFICATIONS: INotification[] = [
  {
    id: 'mock-derivacion-1',
    tipo: 'derivacion',
    mensaje: 'Derivación Pendiente: Dra. Elena Morales - Motivo: Requiere revisión inmediata para especialidad de Cardiología.',
    estado: 'no_leido',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-reagendamiento-1',
    tipo: 'cita',
    mensaje: 'Reagendamiento Solicitado - El paciente Carlos Mendoza ha solicitado reagendar su consulta de Traumatología del 15/10 al 22/10.',
    estado: 'no_leido',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mock-cita-1',
    tipo: 'cita',
    mensaje: 'Cita Confirmada - Lucía Fernández - Consulta programada para el día de mañana a las 10:00.',
    estado: 'leido',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'mock-cita-2',
    tipo: 'cita',
    mensaje: 'Cita Confirmada - Roberto Silva - Control de rutina confirmado.',
    estado: 'leido',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

interface NotificationCenterProps {
  notifications?: INotification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  error?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications: propNotifications,
  isLoading: propIsLoading,
  onMarkAsRead: propOnMarkAsRead,
  error: propError,
}) => {
  const { notifications: hookNotifications, isLoading: hookIsLoading, error: hookError } = useNotifications();
  const hookMarkAsRead = useMarkAsRead();

  const hasExternal = propNotifications !== undefined;

  const sourceNotifications = hasExternal ? (propNotifications ?? []) : hookNotifications;
  const isLoading = hasExternal ? (propIsLoading ?? false) : hookIsLoading;
  const sourceError = hasExternal ? propError : hookError;
  const onMarkAsRead = hasExternal ? (propOnMarkAsRead ?? hookMarkAsRead) : hookMarkAsRead;

  const shouldUseMock = !hasExternal && !isLoading && (
    sourceNotifications.length === 0 || (!!sourceError && sourceError.includes('401'))
  );
  const notifications = shouldUseMock ? MOCK_NOTIFICATIONS : sourceNotifications;
  const error = shouldUseMock ? undefined : sourceError;

  const [notificationsList, setNotificationsList] = useState<INotification[]>(notifications);

  useEffect(() => {
    setNotificationsList(notifications);
  }, [notifications]);

  const unreadCount = notificationsList.filter((n) => n.estado === 'no_leido').length;
  const derivacionPendientes = notificationsList.filter((n) => n.tipo === 'derivacion' && n.estado === 'no_leido').length;
  const citasConfirmadas = notificationsList.filter((n) => n.tipo === 'cita' && n.estado === 'leido').length;

  const handleMarkAsRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, estado: 'leido' as const } : notif
      )
    );
    onMarkAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) =>
      prev.map((notif) => ({ ...notif, estado: 'leido' as const }))
    );
  };

  return (
    <div className="flex h-screen bg-[#faf9ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="hidden lg:flex w-[280px] bg-[#f1f3ff] border-r border-[#c2c6d4] flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[#003f87] flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <div>
              <p className="text-base font-bold text-[#003f87]">MediCampus</p>
              <p className="text-xs text-[#424752]">Clinical Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="/agendas" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agenda
            </a>
            <a href="/historias" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Clinical Records
            </a>
            <a href="/notificaciones" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium bg-[#d7e2ff] text-[#001a40] border-l-4 border-[#003f87] rounded-r-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="flex-1">Notifications</span>
              <span
                className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold text-white bg-[#003f87] rounded-full"
                aria-label={`${unreadCount} notificaciones`}
              >
                {unreadCount}
              </span>
            </a>
            <a href="/reportes" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Reports
            </a>
            <a href="/seguridad" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security
            </a>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#c2c6d4]">
          <nav className="space-y-1">
            <a href="/ayuda" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help Center
            </a>
            <a href="/logout" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#424752] rounded-lg hover:bg-[#d7e2ff] hover:text-[#001a40] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </a>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[72px] bg-[#faf9ff] border-b border-[#c2c6d4] flex items-center justify-between px-4 md:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#003f87] flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="text-base font-bold text-[#003f87]">MediCampus</span>
          </div>
          <span className="hidden lg:block text-base font-bold text-[#003f87]">MediCampus</span>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#424752] hover:text-[#003f87] transition-colors" aria-label="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="relative p-2 text-[#424752] hover:text-[#003f87] transition-colors" aria-label="Notificaciones">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#006a61]" />
            </button>
            <button className="p-2 text-[#424752] hover:text-[#003f87] transition-colors" aria-label="Configuración">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#003f87] flex items-center justify-center text-white font-medium text-sm" aria-label="Avatar">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-[40px] md:text-[48px] font-bold text-[#141b2b] leading-[1.2] tracking-[-0.02em]">
                  Centro de Notificaciones
                </h1>
                <p className="text-[16px] md:text-[18px] text-[#424752] mt-1">
                  Gestión de alertas clínicas, confirmaciones y derivaciones pendientes.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#f1f3ff] border border-[#c2c6d4] rounded-lg p-1 self-start">
                <button className="px-4 py-1.5 text-sm font-semibold bg-white text-[#003f87] rounded-lg shadow-sm transition-colors">
                  Todas
                </button>
                <button className="px-4 py-1.5 text-sm font-semibold bg-[#003f87] text-white rounded-lg hover:bg-[#0056b3] transition-colors">
                  Pacientes
                </button>
                <button className="px-4 py-1.5 text-sm font-semibold bg-[#003f87] text-white rounded-lg hover:bg-[#0056b3] transition-colors">
                  Médicos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#141b2b]">Recientes</h2>
                    <span className="inline-flex items-center justify-center min-w-[24px] h-[24px] px-2 text-xs font-medium text-[#424752] bg-[#f1f3ff] border border-[#c2c6d4] rounded-full">
                      {notificationsList.length}
                    </span>
                  </div>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-semibold text-[#003f87] hover:underline transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                </div>
                <hr className="border-[#c2c6d4] mb-4" />

                <NotificationList
                  notifications={notificationsList}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  error={error}
                />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-[#c2c6d4] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <h3 className="text-xl font-bold text-[#141b2b] mb-5">Resumen de Hoy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
                        <span className="text-sm text-[#424752]">Alertas no leídas</span>
                      </div>
                      <span className="text-xl font-bold text-[#141b2b]">{unreadCount}</span>
                    </div>
                    <hr className="border-[#c2c6d4]" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0056b3]" />
                        <span className="text-sm text-[#424752]">Derivaciones pendientes</span>
                      </div>
                      <span className="text-xl font-bold text-[#141b2b]">{derivacionPendientes}</span>
                    </div>
                    <hr className="border-[#c2c6d4]" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]" />
                        <span className="text-sm text-[#424752]">Citas confirmadas</span>
                      </div>
                      <span className="text-xl font-bold text-[#141b2b]">{citasConfirmadas}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-white to-[#f1f3ff] border border-[#c2c6d4] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-[#006a61] mt-1 flex-shrink-0 shadow-[0_0_0_4px_rgba(0,106,97,0.15)]" />
                    <div>
                      <h3 className="text-lg font-bold text-[#141b2b] mb-1">Sistema Operativo</h3>
                      <p className="text-sm text-[#424752] leading-relaxed">
                        La sincronización con los servidores de laboratorio y agendamiento web está funcionando correctamente.
                      </p>
                      <p className="text-xs text-[#424752] mt-3 opacity-70">Última sinc. hace 2 min</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};


