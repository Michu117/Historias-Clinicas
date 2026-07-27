import React from 'react';

interface InfoModalProps {
  open: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  open,
  title,
  message,
  buttonText = 'Cerrar',
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-2xl shadow-xl p-6 w-full max-w-md mx-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--warning-container, #fef3c7)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--warning, #d97706)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--hc-text)' }}>{title}</h3>
        </div>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-6 rounded-xl text-sm font-bold transition-all"
            style={{
              color: 'var(--btn-primary-text)',
              backgroundColor: 'var(--btn-primary-bg)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
