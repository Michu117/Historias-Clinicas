import React, { useState, useEffect } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationList } from './NotificationList';
import { INotification } from '../types';

interface NotificationCenterProps {
  notifications: INotification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  error?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  error,
}) => {
  const [notificationsList, setNotificationsList] = useState<INotification[]>(notifications);

  // Sincronizar estado local cuando cambian las props
  useEffect(() => {
    setNotificationsList(notifications);
  }, [notifications]);

  // Contar notificaciones no leídas
  const unreadCount = notificationsList.filter((n) => n.estado === 'no_leido').length;

  // Handler para marcar como leída
  const handleMarkAsRead = (id: string) => {
    // Actualizar estado local
    setNotificationsList((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, estado: 'leido' as const } : notif
      )
    );

    // Delegar al callback del padre
    onMarkAsRead(id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Centro de Notificaciones</h1>
        {unreadCount > 0 && (
          <NotificationBadge count={unreadCount} />
        )}
      </div>

      <NotificationList
        notifications={notificationsList}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        error={error}
      />
    </div>
  );
};
