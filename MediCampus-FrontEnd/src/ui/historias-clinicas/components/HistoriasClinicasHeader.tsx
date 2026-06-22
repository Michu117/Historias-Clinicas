import { useNavigate } from 'react-router-dom';

interface HeaderAction {
  label: string;
  onClick: () => void;
}

interface HistoriasClinicasHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  action?: HeaderAction;
  secondaryAction?: HeaderAction;
}

export const HistoriasClinicasHeader = ({
  title,
  subtitle,
  backTo,
  action,
  secondaryAction,
}: HistoriasClinicasHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--hc-text)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: 'var(--on-surface-variant)' }}>{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-5">
        {backTo !== undefined && (
          <button type="button" onClick={handleBack} className="flex items-center gap-1 bg-transparent p-0 text-[14px] font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver
          </button>
        )}
        {secondaryAction && (
          <button type="button" onClick={secondaryAction.onClick} className="bg-transparent p-0 text-[14px] font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            {secondaryAction.label}
          </button>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="rounded-lg px-8 py-3 text-[17px] font-bold text-white shadow-sm transition"
            style={{ backgroundColor: 'var(--btn-primary-bg)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-primary-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--btn-primary-bg)'; }}
          >
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
};

export default HistoriasClinicasHeader;
