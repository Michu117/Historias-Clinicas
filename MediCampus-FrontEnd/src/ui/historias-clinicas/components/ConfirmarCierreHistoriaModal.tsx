import { Button } from '../../../ui/components/Button';
import type { HistoriaClinica } from '../types/historiaClinica.types';

interface ConfirmarCierreHistoriaModalProps {
  isOpen: boolean;
  historia: HistoriaClinica | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmarCierreHistoriaModal = ({
  isOpen,
  historia,
  onConfirm,
  onCancel
}: ConfirmarCierreHistoriaModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cierre-title"
        className="w-full max-w-md rounded-global bg-white p-6 shadow-lg"
      >
        <h2 id="modal-cierre-title" className="text-lg font-semibold text-slate-900">
          Confirmar cierre
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          ¿Desea cerrar la historia clínica {historia?.id ?? ''}? Esta acción marcará el proceso como concluido.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            Confirmar cierre
          </Button>
        </div>
      </div>
    </div>
  );
};
