import React from 'react';
import { INotification } from '../types';

interface NotificationCardProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  isLoading?: boolean;
}

const formatTimestamp = (fecha: string): string => {
  if (!fecha) return '';
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const getRelativeTime = (fecha: string): string => {
  if (!fecha) return '';
  try {
    const now = Date.now();
    const date = new Date(fecha).getTime();
    if (isNaN(date)) return '';
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffMs / 86400000);
    return `Hace ${diffDays}d`;
  } catch {
    return '';
  }
};

const TIPO_LABEL: Record<string, string> = {
  creacion: 'Cita Creada',
  confirmacion: 'Cita Confirmada',
  reagendamiento: 'Reagendamiento',
  cancelacion: 'Cancelación',
  derivacion: 'Derivación',
};

const TIPO_ICON_CLASS: Record<string, { bg: string; iconColor: string }> = {
  creacion: { bg: '#d7e2ff', iconColor: '#003f87' },
  confirmacion: { bg: '#d7e2ff', iconColor: '#003f87' },
  reagendamiento: { bg: '#86f2e4', iconColor: '#006a61' },
  cancelacion: { bg: '#ffdad6', iconColor: '#ba1a1a' },
  derivacion: { bg: '#d7e2ff', iconColor: '#003f87' },
};

function getCardTitle(mensaje: string, tipoBackend: string): string {
  if (tipoBackend === 'derivacion') return 'Derivación Pendiente';
  if (tipoBackend === 'cancelacion') return 'Cita Cancelada';
  if (tipoBackend === 'reagendamiento') return 'Cita Reagendada';
  if (tipoBackend === 'confirmacion') return 'Cita Confirmada';
  if (tipoBackend === 'creacion') return 'Cita Agendada';
  return 'Notificación';
}

function getMotivo(mensaje: string): string | null {
  const match = mensaje.match(/Motivo:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isLoading = false,
}) => {
  const { tipo, tipoBackend, mensaje, estado, fecha_creacion } = notification;
  const isUnread = estado === 'no_leido';
  const cardTitle = getCardTitle(mensaje, tipoBackend);
  const tipoLabel = TIPO_LABEL[tipoBackend] || (tipo === 'cita' ? 'Cita' : 'Derivación');
  const iconStyle = TIPO_ICON_CLASS[tipoBackend] || TIPO_ICON_CLASS.creacion;
  const motivo = getMotivo(mensaje);
  const showMotivoBox = tipoBackend === 'derivacion' && motivo;
  const isDerivacion = tipoBackend === 'derivacion';

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  return (
    <div
      className={`bg-white border rounded-2xl p-6 shadow-sm transition-colors ${isUnread ? 'bg-gray-50' : ''}`}
      style={{ borderColor: 'var(--outline)' }}
      data-testid="notification-card"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: iconStyle.bg }}
          aria-hidden="true"
        >
          {isDerivacion ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.iconColor }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20l5-5-5-5M3 4v8a4 4 0 004 4h12M7 4l-5 5 5 5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: iconStyle.iconColor }}>
              {tipoBackend === 'cancelacion' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              )}
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>
              {tipoLabel}
            </span>
            {isUnread && isDerivacion && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ffdad6', color: '#ba1a1a' }}>
                Alta Prioridad
              </span>
            )}
            {isUnread && (
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: 'var(--secondary)' }} aria-hidden="true" />
            )}
            <span className="text-xs ml-auto" style={{ color: 'var(--on-surface-variant)' }}>{getRelativeTime(fecha_creacion)}</span>
          </div>

          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--hc-text)' }}>{cardTitle}</h3>

          <p className="text-sm mb-1" style={{ color: 'var(--hc-text)' }}>{mensaje}</p>

          <time className="text-xs" style={{ color: 'var(--on-surface-variant)' }} dateTime={fecha_creacion}>
            {formatTimestamp(fecha_creacion)}
          </time>

          {showMotivoBox && (
            <div className="mt-3 p-4 rounded-xl border-l-4" style={{ backgroundColor: 'var(--surface-container-low)', borderColor: 'var(--error)', borderLeftColor: 'var(--error)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--hc-text)' }}>Motivo de Derivación</p>
              <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{motivo}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {isUnread && (
              <button
                aria-label="Marcar como leída"
                onClick={handleMarkAsRead}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--on-surface-variant)', borderColor: 'var(--outline)', backgroundColor: 'transparent' }}
              >
                {isLoading ? '...' : 'Marcar como leída'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
