import { useState, type FC } from 'react';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';

interface AgendaFiltersProps {
  onFilterChange: (dates: { desde: string; hasta: string }) => void;
  defaultDates: { desde: string; hasta: string };
}

export const AgendaFilters: FC<AgendaFiltersProps> = ({
  onFilterChange,
  defaultDates,
}) => {
  const [desde, setDesde] = useState(defaultDates.desde);
  const [hasta, setHasta] = useState(defaultDates.hasta);

  const handleFilter = () => {
    onFilterChange({ desde, hasta });
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2" htmlFor="desde">
          Desde
        </label>
        <Input
          id="desde"
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2" htmlFor="hasta">
          Hasta
        </label>
        <Input
          id="hasta"
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
      </div>
      <div className="flex items-end">
        <Button onClick={handleFilter}>Filtrar</Button>
      </div>
    </div>
  );
};
