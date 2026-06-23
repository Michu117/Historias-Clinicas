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
    <div data-testid="derivacion-card" className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Motivo</p>
          <p className="text-base font-medium">{derivacion.motivo}</p>
        </div>
        <EstadoBadge estado={derivacion.estado} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Servicio Origen</p>
          <p className="font-medium">ID: {derivacion.profesional_origen_id}</p>
        </div>
        <div>
          <p className="text-gray-500">Fecha</p>
          <p className="font-medium">{fechaFormateada}</p>
        </div>
      </div>

      {derivacion.estado === EstadoDerivacion.PENDIENTE && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAceptar(derivacion.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            {messages.actions.aceptar}
          </button>
          <button
            onClick={() => onRechazar(derivacion.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            {messages.actions.rechazar}
          </button>
        </div>
      )}
    </div>
  );
};
