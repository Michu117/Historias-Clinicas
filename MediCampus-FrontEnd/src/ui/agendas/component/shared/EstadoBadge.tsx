import { type FC } from 'react';

interface EstadoBadgeProps {
  estado: string;
}

const estadoColors: Record<string, { bg: string; text: string }> = {
  AGENDADA: { bg: 'var(--primary-fixed)', text: 'var(--on-primary-fixed)' },
  ATENDIDA: { bg: 'var(--secondary-container)', text: 'var(--on-secondary-container)' },
  CANCELADA: { bg: '#fef2f2', text: '#991b1b' },
  CONFIRMADA: { bg: '#fef3c7', text: '#92400e' },
  NO_ASISTIDA: { bg: 'var(--surface-container-low)', text: 'var(--on-surface-variant)' },
  REAGENDADA: { bg: '#f3e8ff', text: '#6b21a8' },
};

export const EstadoBadge: FC<EstadoBadgeProps> = ({ estado }) => {
  const colors = estadoColors[estado] || { bg: 'var(--surface-container-low)', text: 'var(--on-surface-variant)' };

  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}
    </span>
  );
};
