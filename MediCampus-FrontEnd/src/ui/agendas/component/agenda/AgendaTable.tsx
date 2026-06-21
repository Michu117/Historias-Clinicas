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
          <thead className="bg-gray-100 border-b">
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
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
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
