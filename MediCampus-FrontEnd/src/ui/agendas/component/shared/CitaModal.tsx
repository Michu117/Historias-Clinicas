import { type FC } from 'react';
import { Cita } from '../../types';
import { EstadoBadge } from './EstadoBadge';
import { CertificateButton } from './CertificateButton';

interface CitaModalProps {
  cita: Cita;
  open: boolean;
  onClose: () => void;
  onAction?: (action: string, payload: unknown) => void;
}

export const CitaModal: FC<CitaModalProps> = ({ cita, open, onClose, onAction }) => {
  if (!open) return null;

  const isAtendida = String(cita.estado) === 'ATENDIDA' || String(cita.estado) === 'COMPLETADA';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="rounded-lg shadow-lg p-6 max-w-md w-full" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--hc-text)' }}>Detalles de Cita</h2>
          <button
            onClick={onClose}
            className="text-sm hover:opacity-70"
            style={{ color: 'var(--on-surface-variant)' }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--on-surface-variant)' }}>Hora</label>
            <p className="text-lg" style={{ color: 'var(--hc-text)' }}>{cita.hora}</p>
          </div>
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--on-surface-variant)' }}>Motivo</label>
            <p className="text-lg" style={{ color: 'var(--hc-text)' }}>{cita.motivo}</p>
          </div>
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--on-surface-variant)' }}>Paciente</label>
            <p className="text-lg" style={{ color: 'var(--hc-text)' }}>ID: {cita.paciente_id}</p>
          </div>
          <div>
            <label className="text-sm font-semibold" style={{ color: 'var(--on-surface-variant)' }}>Estado</label>
            <div className="mt-1">
              <EstadoBadge estado={cita.estado} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {isAtendida && (
            <CertificateButton
              citaId={cita.id}
              estado={String(cita.estado)}
            />
          )}
          {isAtendida && onAction && (
            <button
              onClick={() => onAction('derivar', { citaId: cita.id })}
              className="px-4 py-2 rounded hover:opacity-90 transition-all"
              style={{ backgroundColor: 'var(--btn-info-bg)', color: 'var(--btn-info-text)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-info-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-info-bg)'; }}
            >
              Derivar Paciente
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded hover:opacity-90 transition-all"
            style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
