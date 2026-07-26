import { type FC } from 'react';
import { Derivacion, EstadoDerivacion } from '../../types';
import { EstadoBadge } from '../shared/EstadoBadge';
import { messages } from '../../utils/constants/messages';

interface DerivacionCardProps {
  derivacion: Derivacion;
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
}

export const DerivacionCard: FC<DerivacionCardProps> = ({ derivacion, onAceptar, onRechazar }) => {
  const fechaFormateada = new Date(derivacion.fecha_creacion).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div data-testid="derivacion-card" className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Motivo</p>
          <p className="text-base font-medium line-clamp-3" style={{ color: 'var(--on-surface)' }} title={derivacion.motivo}>{derivacion.motivo}</p>
        </div>
        <EstadoBadge estado={derivacion.estado} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Servicio Origen</p>
          <p className="font-medium" style={{ color: 'var(--on-surface)' }}>ID: {derivacion.profesional_origen_id}</p>
        </div>
        <div>
          <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Fecha</p>
          <p className="font-medium" style={{ color: 'var(--on-surface)' }}>{fechaFormateada}</p>
        </div>
      </div>

      {derivacion.estado === EstadoDerivacion.PENDIENTE && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAceptar(derivacion.id)}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-container)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)' }}
          >
            {messages.actions.aceptar}
          </button>
          <button
            onClick={() => onRechazar(derivacion.id)}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{ backgroundColor: 'var(--error)', color: 'var(--on-error)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--error-container)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--error)' }}
          >
            {messages.actions.rechazar}
          </button>
        </div>
      )}
    </div>
  );
};
