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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-cierre-title"
        className="w-full max-w-md rounded-lg p-6 shadow-lg"
        style={{ backgroundColor: 'var(--card-bg)' }}
      >
        <h2 id="modal-cierre-title" className="text-lg font-semibold" style={{ color: 'var(--hc-text)' }}>
          Confirmar cierre
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
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
