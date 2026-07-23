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
      className="border-b cursor-pointer"
      style={{ borderColor: 'var(--card-border)' }}
      onClick={() => onClick(cita)}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--table-row-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <td className="px-4 py-2" style={{ color: 'var(--on-surface)' }}>{cita.hora}</td>
      <td className="px-4 py-2" style={{ color: 'var(--on-surface)' }}>Paciente {cita.paciente_id}</td>
      <td className="px-4 py-2" style={{ color: 'var(--on-surface)' }}>{cita.motivo}</td>
      <td className="px-4 py-2">
        <EstadoBadge estado={cita.estado} />
      </td>
    </tr>
  );
};
