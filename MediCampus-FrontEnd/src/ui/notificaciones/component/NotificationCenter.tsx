import React, { useState, useEffect } from 'react';
import { NotificationList } from './NotificationList';
import { INotification } from '../types';
import { useNotifications, useMarkAsRead } from '../api';
import { SideNavBar } from '../../agendas/component/shared/SideNavBar';

export const NotificationCenter: React.FC = () => {
  const { notifications, isLoading, error } = useNotifications();
  const hookMarkAsRead = useMarkAsRead();

  const [notificationsList, setNotificationsList] = useState<INotification[]>([]);

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
    hookMarkAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) =>
      prev.map((notif) => ({ ...notif, estado: 'leido' as const }))
    );
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <SideNavBar />
      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        <header
          className="flex justify-end items-center h-16 px-8 border-b sticky top-0 z-40"
          style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: 'var(--outline)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'var(--primary-container)', borderColor: 'var(--outline-variant)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--on-primary-container)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--on-primary-container)' }}>
              {unreadCount} no leídas
            </span>
          </div>
        </header>

        <div className="p-10 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1" style={{ color: 'var(--hc-text)' }}>
                Centro de Notificaciones
              </h1>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                Gestión de alertas, confirmaciones y notificaciones del sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold" style={{ color: 'var(--hc-text)' }}>Recientes</h2>
                  <span
                    className="inline-flex items-center justify-center min-w-[24px] h-[24px] px-2 text-xs font-medium rounded-full"
                    style={{ color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-low)', border: '1px solid var(--outline)' }}
                  >
                    {notificationsList.length}
                  </span>
                </div>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-bold transition-all"
                  style={{ color: 'var(--primary)' }}
                >
                  Marcar todas como leídas
                </button>
              </div>
              <hr style={{ borderColor: 'var(--outline)' }} className="mb-4" />

              <NotificationList
                notifications={notificationsList}
                isLoading={isLoading}
                onMarkAsRead={handleMarkAsRead}
                error={error || undefined}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div
                className="bg-white border rounded-2xl p-6 shadow-sm"
                style={{ borderColor: 'var(--outline)' }}
              >
                <h3 className="text-xl font-bold mb-5" style={{ color: 'var(--hc-text)' }}>Resumen</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--error)' }} />
                      <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>No leídas</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--hc-text)' }}>{unreadCount}</span>
                  </div>
                  <hr style={{ borderColor: 'var(--outline)' }} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Derivaciones pendientes</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--hc-text)' }}>{derivacionPendientes}</span>
                  </div>
                  <hr style={{ borderColor: 'var(--outline)' }} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Completadas</span>
                    </div>
                    <span className="text-xl font-bold" style={{ color: 'var(--hc-text)' }}>{citasConfirmadas}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
