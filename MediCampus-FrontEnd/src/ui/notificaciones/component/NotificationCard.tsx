import React from 'react';
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

const getRelativeTime = (isoString: string): string => {
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffMs / 86400000);
  return `Hace ${diffDays}d`;
};

const getMotivo = (mensaje: string): string | null => {
  const match = mensaje.match(/Motivo:\s*(.+)/i);
  return match ? match[1].trim() : null;
};

const parseNotification = (mensaje: string, tipo: INotificationType) => {
  let title: string;
  let mainText = mensaje;
  let motivo: string | null = null;
  let isReagendamiento = tipo === 'cita' && /reagend/i.test(mensaje);

  if (tipo === 'derivacion') {
    const derivMatch = mensaje.match(/^Derivación Pendiente:\s*(.+?)\s*-\s*Motivo:\s*(.+)/i);
    if (derivMatch) {
      title = `Derivación Pendiente: ${derivMatch[1].trim()}`;
      motivo = derivMatch[2].trim();
      mainText = motivo;
    } else {
      motivo = getMotivo(mensaje);
      title = 'Derivación Pendiente';
      if (motivo) {
        mainText = mensaje;
      }
    }
  } else if (/^Reagendamiento\s+Solicitado/i.test(mensaje)) {
    isReagendamiento = true;
    title = 'Reagendamiento Solicitado';
    mainText = mensaje.replace(/^Reagendamiento\s+Solicitado\s*-\s*/i, '').trim();
  } else if (/^Cita\s+Confirmada/i.test(mensaje)) {
    title = 'Cita Confirmada';
    mainText = mensaje.replace(/^Cita\s+Confirmada\s*-\s*/i, '').trim();
  } else if (/reagend/i.test(mensaje)) {
    isReagendamiento = true;
    title = 'Reagendamiento Solicitado';
  } else {
    title = 'Nueva Cita';
  }

  return { title, mainText, motivo, isReagendamiento };
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isLoading = false,
}) => {
  const { tipo, mensaje, estado, timestamp } = notification;
  const isUnread = estado === 'no_leido';
  const { title, mainText, motivo, isReagendamiento } = parseNotification(mensaje, tipo);

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const showMotivoBox = tipo === 'derivacion' && motivo;

  return (
    <div
      className={`bg-white border border-[#c2c6d4] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ${
        isUnread ? 'bg-gray-100' : ''
      } transition-colors`}
      data-testid="notification-card"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            tipo === 'derivacion'
              ? 'bg-[#d7e2ff] border border-[#acc7ff]'
              : isReagendamiento || isUnread
                ? 'bg-[#86f2e4]'
                : 'bg-gray-100'
          }`}
          aria-hidden="true"
        >
          {tipo === 'derivacion' ? (
            <svg className="w-5 h-5 text-[#003f87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20l5-5-5-5M3 4v8a4 4 0 004 4h12M7 4l-5 5 5 5" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[#006a61]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium text-[#424752] uppercase tracking-wide">
              {tipo === 'cita' ? 'Cita' : 'Derivación'}
            </span>
            {isUnread && tipo === 'derivacion' && (
              <span className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                Alta Prioridad
              </span>
            )}
            {isUnread && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#006a61] shadow-[0_0_0_4px_rgba(0,106,97,0.2)]" aria-hidden="true" />
            )}
            <span className="text-xs text-[#424752] ml-auto">{getRelativeTime(timestamp)}</span>
          </div>

          <h3 className="text-lg font-bold text-[#141b2b] mb-1">{title}</h3>

          <p className="text-sm text-[#141b2b] mb-1">{mainText || mensaje}</p>

          <time className="text-xs text-[#424752]" dateTime={timestamp}>
            {formatTimestamp(timestamp)}
          </time>

          {showMotivoBox && (
            <div className="mt-3 bg-[#f1f3ff] border border-[#c2c6d4] border-l-4 border-l-[#ba1a1a] rounded-[12px] p-4">
              <p className="text-xs font-semibold text-[#141b2b] mb-1">Motivo de Derivación</p>
              <p className="text-sm text-[#424752]">{motivo}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {tipo === 'cita' && isReagendamiento && (
              <button className="px-4 py-2 text-sm font-medium text-white bg-[#006a61] rounded-lg hover:bg-[#005049] transition-colors">
                Aprobar Cambio
              </button>
            )}
            {tipo === 'derivacion' && (
              <>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#0056b3] rounded-lg hover:bg-[#004a9a] transition-colors">
                  Revisar Expediente
                </button>
                <button className="px-4 py-2 text-sm font-medium text-[#141b2b] bg-white border border-[#c2c6d4] rounded-lg hover:bg-gray-50 transition-colors">
                  Asignar Turno
                </button>
              </>
            )}
            {isUnread && (
              <button
                aria-label="Marcar como leída"
                onClick={handleMarkAsRead}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium text-[#424752] bg-transparent border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span data-testid="loading-spinner" className="inline-block">{'\u23F3'}</span>
                ) : (
                  'Marcar como leída'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
