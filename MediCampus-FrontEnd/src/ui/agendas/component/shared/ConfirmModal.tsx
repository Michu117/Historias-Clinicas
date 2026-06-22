import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--hc-text)' }}>{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            style={{
              color: 'var(--btn-secondary-text)',
              backgroundColor: 'var(--btn-secondary-bg)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-secondary-bg)'; }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 px-5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              color: 'var(--btn-danger-text)',
              backgroundColor: 'var(--btn-danger-bg)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-danger-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-danger-bg)'; }}
          >
            {isLoading ? 'Cancelando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
