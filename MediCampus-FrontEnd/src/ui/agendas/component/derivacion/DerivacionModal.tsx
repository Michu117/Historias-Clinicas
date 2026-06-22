import { type FC, useState, useMemo } from 'react';
import { Servicio } from '../../types';
import { messages } from '../../utils/constants/messages';

interface DerivacionModalProps {
  citaId: number;
  servicioActualId: number;
  servicios: Servicio[];
  open: boolean;
  onSubmit: (data: { cita_origen_id: number; servicio_destino_id: number; motivo: string }) => void;
  onCancel: () => void;
}

export const DerivacionModal: FC<DerivacionModalProps> = ({
  citaId,
  servicioActualId,
  servicios,
  open,
  onSubmit,
  onCancel,
}) => {
  const [servicioDestinoId, setServicioDestinoId] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');

  const serviciosDisponibles = useMemo(() => {
    return servicios.filter(s => s.id !== servicioActualId && s.es_activo);
  }, [servicios, servicioActualId]);

  const motivoValido = motivo.trim().length >= 10;
  const puedeDerivar = servicioDestinoId !== '' && motivoValido;

  const handleSubmit = () => {
    if (!puedeDerivar) return;
    onSubmit({
      cita_origen_id: citaId,
      servicio_destino_id: Number(servicioDestinoId),
      motivo: motivo.trim(),
    });
    setServicioDestinoId('');
    setMotivo('');
  };

  const handleCancel = () => {
    setServicioDestinoId('');
    setMotivo('');
    onCancel();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{messages.derivacion.modalTitle}</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="servicio-destino" className="block text-sm font-semibold text-gray-600 mb-1">
              {messages.derivacion.servicioDestino}
            </label>
            <select
              id="servicio-destino"
              value={servicioDestinoId}
              onChange={(e) => setServicioDestinoId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">{messages.derivacion.selectDestino}</option>
              {serviciosDisponibles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="motivo-derivacion" className="block text-sm font-semibold text-gray-600 mb-1">
              {messages.derivacion.motivo}
            </label>
            <textarea
              id="motivo-derivacion"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder={messages.derivacion.motivoPlaceholder}
            />
            {motivo.length > 0 && !motivoValido && (
              <p className="text-red-500 text-xs mt-1">{messages.derivacion.motivoMinLength}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {messages.actions.cancelar}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!puedeDerivar}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {messages.derivacion.derivar}
          </button>
        </div>
      </div>
    </div>
  );
};
