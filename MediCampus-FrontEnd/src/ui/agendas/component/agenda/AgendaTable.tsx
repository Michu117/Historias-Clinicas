import { type FC } from 'react';
import { Cita } from '../../types';
import { CitaRow } from './CitaRow';
import { Card } from '../../../components/Card';

interface AgendaTableProps {
  citas: Cita[];
  onClickRow: (cita: Cita) => void;
  loading: boolean;
}

export const AgendaTable: FC<AgendaTableProps> = ({ citas, onClickRow, loading }) => {
  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  return (
    <Card className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b" style={{ backgroundColor: 'var(--surface-container-high)', borderColor: 'var(--card-border)' }}>
            <tr>
              <th className="px-4 py-2 text-left">Hora</th>
              <th className="px-4 py-2 text-left">Paciente</th>
              <th className="px-4 py-2 text-left">Motivo</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center" style={{ color: 'var(--on-surface-variant)' }}>
                  No hay citas
                </td>
              </tr>
            ) : (
              citas.map((cita) => <CitaRow key={cita.id} cita={cita} onClick={onClickRow} />)
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
