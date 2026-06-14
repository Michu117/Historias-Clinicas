import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationCard } from '../component/NotificationCard';
import { INotification } from '../types';

describe('NotificationCard', () => {
  const mockNotification: INotification = {
    id: '1',
    tipo: 'cita',
    mensaje: 'Nueva cita programada para el 2026-06-01',
    estado: 'no_leido',
    timestamp: '2026-05-26T10:30:00Z',
  };

  const mockOnMarkAsRead = vi.fn();

  it('renderiza tipo de notificación (cita/derivación)', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    expect(screen.getByText(/^Cita$/i)).toBeInTheDocument();
  });

  it('renderiza mensaje tal cual llega del backend', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    expect(screen.getByText('Nueva cita programada para el 2026-06-01')).toBeInTheDocument();
  });

  it('renderiza timestamp legible', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    expect(screen.getByText(/26.*05.*2026|2026.*05.*26/)).toBeInTheDocument();
  });

  it('diferencia visual entre no leído (fondo resaltado) vs leído (normal)', () => {
    const { rerender } = render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    let card = screen.getByTestId('notification-card');
    expect(card).toHaveClass('bg-gray-100');

    const readNotification: INotification = {
      ...mockNotification,
      estado: 'leido',
    };

    rerender(
      <NotificationCard
        notification={readNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    card = screen.getByTestId('notification-card');
    expect(card).not.toHaveClass('bg-gray-100');
  });

  it('botón "Marcar como leída" renderiza solo si estado = no_leido', () => {
    const { rerender } = render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );
    expect(screen.getByRole('button', { name: /marcar como leída/i })).toBeInTheDocument();

    const readNotification: INotification = {
      ...mockNotification,
      estado: 'leido',
    };

    rerender(
      <NotificationCard
        notification={readNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.queryByRole('button', { name: /marcar como leída/i })).not.toBeInTheDocument();
  });

  it('click en botón dispara onMarkAsRead(id) con notificationId', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const button = screen.getByRole('button', { name: /marcar como leída/i });
    fireEvent.click(button);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it('botón muestra loading state mientras isLoading = true', () => {
    render(
      <NotificationCard
        notification={mockNotification}
        onMarkAsRead={mockOnMarkAsRead}
        isLoading={true}
      />
    );

    const button = screen.getByRole('button', { name: /marcar como leída/i });
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renderiza notificación de tipo derivacion', () => {
    const derivationNotification: INotification = {
      id: '2',
      tipo: 'derivacion',
      mensaje: 'Paciente derivado a tu servicio. Motivo: evaluación cardiológica',
      estado: 'no_leido',
      timestamp: '2026-05-26T09:15:00Z',
    };

    render(
      <NotificationCard
        notification={derivationNotification}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText(/^Derivación$/i)).toBeInTheDocument();
    expect(screen.getByText('Paciente derivado a tu servicio. Motivo: evaluación cardiológica')).toBeInTheDocument();
  });
});
