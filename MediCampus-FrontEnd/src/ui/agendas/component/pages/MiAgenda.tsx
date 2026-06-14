import { useEffect, useState } from 'react';
import { useAgenda } from '../../hooks/useAgenda';
import { AgendaFilters } from '../agenda/AgendaFilters';
import { AgendaTable } from '../agenda/AgendaTable';
import { CitaModal } from '../shared/CitaModal';
import { Cita } from '../../types';

export const MiAgenda: React.FC = () => {
  const { citas, loading, loadAgenda, filterByDateRange } = useAgenda();
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  useEffect(() => {
    loadAgenda(today, in30Days);
  }, [loadAgenda, today, in30Days]);

  const handleFilterChange = (dates: { desde: string; hasta: string }) => {
    filterByDateRange(dates.desde, dates.hasta);
  };

  const handleRowClick = (cita: Cita) => {
    setSelectedCita(cita);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCita(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mi Agenda</h1>
        <p className="text-gray-600">Consulta y gestiona tus citas médicas</p>
      </div>

      <AgendaFilters
        onFilterChange={handleFilterChange}
        defaultDates={{ desde: today, hasta: in30Days }}
      />

      <div>
        <h2 className="text-xl font-semibold mb-4">Tabla de Citas</h2>
        <AgendaTable citas={citas} onClickRow={handleRowClick} loading={loading} />
      </div>

      {selectedCita && (
        <CitaModal cita={selectedCita} open={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
};
