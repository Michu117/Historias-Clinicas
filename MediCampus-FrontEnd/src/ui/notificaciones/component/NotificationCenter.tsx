import React, { useState, useEffect } from 'react';
import { NotificationList } from './NotificationList';
import { INotification } from '../types';
import { useNotifications, useMarkAsRead } from '../api';
import { HamburgerMenuDropdown } from '../../components/HamburgerMenuDropdown';

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--hc-bg)' }}>
      <header
        className="flex items-center gap-3 h-16 px-6 border-b shrink-0"
        style={{ backgroundColor: 'var(--surface-container-lowest)', borderColor: 'var(--outline)' }}
      >
        <HamburgerMenuDropdown />
        <h2 className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>Notificaciones</h2>
      </header>
      <main className="flex-1 overflow-y-auto">
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
                className="border rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--outline)' }}
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
