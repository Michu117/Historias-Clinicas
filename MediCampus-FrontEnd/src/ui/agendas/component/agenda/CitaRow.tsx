import { type FC } from 'react';
import { Cita } from '../../types';
import { EstadoBadge } from '../shared/EstadoBadge';

interface CitaRowProps {
  cita: Cita;
  onClick: (cita: Cita) => void;
}

export const CitaRow: FC<CitaRowProps> = ({ cita, onClick }) => {
  return (
    <tr
      className="border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(cita)}
    >
      <td className="px-4 py-2">{cita.hora}</td>
      <td className="px-4 py-2">Paciente {cita.paciente_id}</td>
      <td className="px-4 py-2">{cita.motivo}</td>
      <td className="px-4 py-2">
        <EstadoBadge estado={cita.estado} />
      </td>
    </tr>
  );
};
