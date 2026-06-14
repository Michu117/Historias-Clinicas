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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-5">
        {backTo !== undefined && (
          <button type="button" onClick={handleBack} className="flex cursor-pointer items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Volver
          </button>
        )}

        {secondaryAction && (
          <button type="button" onClick={secondaryAction.onClick} className="cursor-pointer">
            {secondaryAction.label}
          </button>
        )}

        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="rounded-lg bg-[#2563eb] px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
          >
            {action.label}
          </button>
        )}
      </div>
    </header>
  );
};

export default HistoriasClinicasHeader;
