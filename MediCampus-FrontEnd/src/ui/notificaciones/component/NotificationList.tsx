import React from 'react';
import { NotificationCard } from './NotificationCard';
import { INotification } from '../types';

interface NotificationListProps {
  notifications: INotification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  error?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  error,
}) => {
  // Ordenar por timestamp descendente (más reciente primero)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (isLoading) {
    return (
      <div data-testid="notification-list-loading" className="flex items-center justify-center py-8">
        <div className="text-sm text-slate-500">Cargando notificaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  if (sortedNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-slate-500">No tienes notificaciones</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedNotifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};
