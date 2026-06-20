import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationCenter } from '../component/NotificationCenter';
import { INotification } from '../types';

describe('NotificationCenter', () => {
  const mockNotificationCita: INotification = {
    id: '1',
    tipo: 'cita',
    mensaje: 'Nueva cita programada',
    estado: 'no_leido',
    timestamp: '2026-06-10T14:30:00Z',
  };

  const mockNotificationDerivacion: INotification = {
    id: '2',
    tipo: 'derivacion',
    mensaje: 'Paciente derivado a tu servicio',
    estado: 'no_leido',
    timestamp: '2026-06-09T16:45:00Z',
  };

  const mockOnMarkAsRead = vi.fn();

  beforeEach(() => {
    mockOnMarkAsRead.mockClear();
  });

  it('renderiza título "Centro de Notificaciones"', () => {
    render(
      <NotificationCenter
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('Centro de Notificaciones')).toBeInTheDocument();
  });

  it('renderiza NotificationBadge con count de no leídas', () => {
    const notifications = [mockNotificationCita, mockNotificationDerivacion];
    render(
      <NotificationCenter
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renderiza NotificationList con notificaciones', () => {
    const notifications = [mockNotificationCita, mockNotificationDerivacion];
    render(
      <NotificationCenter
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('Nueva cita programada')).toBeInTheDocument();
    expect(screen.getByText('Paciente derivado a tu servicio')).toBeInTheDocument();
  });

  it('muestra loading cuando isLoading = true', () => {
    render(
      <NotificationCenter
        notifications={[]}
        isLoading={true}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByTestId('notification-list-loading')).toBeInTheDocument();
  });

  it('muestra error cuando error existe', () => {
    const errorMessage = 'Error al cargar notificaciones';
    render(
      <NotificationCenter
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('muestra estado vacío cuando notifications = []', () => {
    render(
      <NotificationCenter
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('click en "Marcar como leída" llama onMarkAsRead(id)', () => {
    const notifications = [mockNotificationCita];
    render(
      <NotificationCenter
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const button = screen.getByRole('button', { name: /marcar como leída/i });
    fireEvent.click(button);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('después de marcar como leída, el badge decrementa', () => {
    const initialNotifications = [mockNotificationCita, mockNotificationDerivacion];

    const { rerender } = render(
      <NotificationCenter
        notifications={initialNotifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();

    const updatedNotifications = [
      { ...mockNotificationCita, estado: 'leido' as const },
      mockNotificationDerivacion,
    ];

    rerender(
      <NotificationCenter
        notifications={updatedNotifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
