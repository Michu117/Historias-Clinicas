import { type FC } from 'react';

interface EstadoBadgeProps {
  estado: string;
}

const estadoColors: { [key: string]: string } = {
  AGENDADA: 'bg-blue-500 text-white',
  ATENDIDA: 'bg-green-500 text-white',
  CANCELADA: 'bg-red-500 text-white',
  CONFIRMADA: 'bg-yellow-500 text-white',
  NO_ASISTIDA: 'bg-gray-500 text-white',
};

export const EstadoBadge: FC<EstadoBadgeProps> = ({ estado }) => {
  const colorClass = estadoColors[estado] || 'bg-gray-300';

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}
    </span>
  );
};
