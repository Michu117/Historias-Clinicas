import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';
import { Input } from '../../../ui/components/Input';
import { Select } from '../../../ui/components/Select';

interface HistoriasClinicasFiltersPanelProps {
  searchValue: string;
  statusValue: string;
  statusOptions: { value: string; label: string }[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export const HistoriasClinicasFiltersPanel = ({
  searchValue,
  statusValue,
  statusOptions,
  onSearchChange,
  onStatusChange,
  onClearFilters,
}: HistoriasClinicasFiltersPanelProps) => {
  return (
    <Card className="shrink-0 p-3">
      <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto,auto] md:items-end">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="historia-search"
            className="text-sm font-medium text-slate-700"
          >
            Buscar historia clínica
          </label>

          <Input
            id="historia-search"
            value={searchValue}
            placeholder="Buscar por nombre, identificación o código HC..."
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select
          label="Estado"
          value={statusValue}
          options={statusOptions}
          onChange={(event) => onStatusChange(event.target.value)}
        />
        
        <Button
          type="button"
          variant="tertiary"
          onClick={onClearFilters}
        >
          Limpiar filtros
        </Button>
      </div>
    </Card>
  );
};