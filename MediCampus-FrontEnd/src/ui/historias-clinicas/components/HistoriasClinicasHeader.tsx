import { Button } from '../../../ui/components/Button';

interface HistoriasClinicasHeaderProps {
  title: string;
  subtitle: string;
  showAction: boolean;
  onNuevaHistoria: () => void;
}

export const HistoriasClinicasHeader = ({
  title,
  subtitle,
  showAction,
  onNuevaHistoria
}: HistoriasClinicasHeaderProps) => {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {showAction ? (
        <Button type="button" onClick={onNuevaHistoria}>
          Nueva Historia Clínica
        </Button>
      ) : null}
    </header>
  );
};
