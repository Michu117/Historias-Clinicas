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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalles de Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-gray-600">Hora</label>
            <p className="text-lg">{cita.hora}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Motivo</label>
            <p className="text-lg">{cita.motivo}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Paciente</label>
            <p className="text-lg">ID: {cita.paciente_id}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600">Estado</label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Derivar Paciente
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
