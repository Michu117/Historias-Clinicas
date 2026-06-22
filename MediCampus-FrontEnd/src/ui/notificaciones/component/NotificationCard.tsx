import React from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { INotification } from '../types';

interface NotificationCardProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getNotificationTypeLabel = (tipo: string): string => {
  const labels: Record<string, string> = {
    cita: 'Cita',
    derivacion: 'Derivación',
  };
  return labels[tipo] || tipo;
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isLoading = false,
}) => {
  const isUnread = notification.estado === 'no_leido';
  const backgroundStyle = isUnread
    ? { backgroundColor: 'var(--surface-container-low)' }
    : { backgroundColor: 'var(--card-bg)' };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <Card
      className="transition-colors"
      style={backgroundStyle}
      data-testid="notification-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-block px-2 py-1 text-xs font-semibold rounded"
              style={{ color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-container-high)' }}
            >
              {getNotificationTypeLabel(notification.tipo)}
            </span>
            {isUnread && (
              <span aria-hidden="true" className="inline-block w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          <p className="text-sm mb-2" style={{ color: 'var(--on-surface)' }}>{notification.mensaje}</p>
          <time className="text-xs" style={{ color: 'var(--on-surface-variant)' }} dateTime={notification.timestamp}>
            {formatTimestamp(notification.timestamp)}
          </time>
        </div>

        {isUnread && (
          <div className="flex-shrink-0">
            <Button
              variant="secondary"
              onClick={handleMarkAsRead}
              disabled={isLoading}
              aria-label="Marcar como leída"
              className="text-xs px-2 py-1 h-auto"
            >
              {isLoading ? (
                <span data-testid="loading-spinner" className="inline-block">
                  ⏳
                </span>
              ) : (
                'Marcar como leída'
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
