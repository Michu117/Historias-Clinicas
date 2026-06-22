import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationBell } from '../component/NotificationBell';
import { INotification } from '../types';

describe('NotificationBell', () => {
  const mockNotification: INotification = {
    id: '1', tipo: 'cita', tipoBackend: 'creacion', fecha_creacion: '2026-06-10T14:30:00Z', timestamp: '2026-06-10T14:30:00Z',
    mensaje: 'Nueva cita programada', estado: 'no_leido',
  };

  const mockNotification2: INotification = {
    id: '2', tipo: 'derivacion', tipoBackend: 'derivacion', fecha_creacion: '2026-06-09T16:45:00Z', timestamp: '2026-06-09T16:45:00Z',
    mensaje: 'Paciente derivado', estado: 'no_leido',
  };

  const mockOnMarkAsRead = vi.fn();

  beforeEach(() => {
    mockOnMarkAsRead.mockClear();
  });

  it('renderiza botón de campana cerrado inicialmente', () => {
    render(
      <NotificationBell
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const bellButton = screen.getByTestId('notification-bell-button');
    expect(bellButton).toBeInTheDocument();
    expect(screen.queryByTestId('notification-bell-dropdown')).not.toBeInTheDocument();
  });

  it('muestra NotificationBadge con count de no leídas', () => {
    const notifications = [mockNotification, mockNotification2];
    render(
      <NotificationBell
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('click en campana abre dropdown', () => {
    render(
      <NotificationBell
        notifications={[mockNotification]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const bellButton = screen.getByTestId('notification-bell-button');
    fireEvent.click(bellButton);

    expect(screen.getByTestId('notification-bell-dropdown')).toBeInTheDocument();
  });

  it('click nuevamente cierra dropdown', () => {
    render(
      <NotificationBell
        notifications={[mockNotification]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const bellButton = screen.getByTestId('notification-bell-button');

    fireEvent.click(bellButton);
    expect(screen.getByTestId('notification-bell-dropdown')).toBeInTheDocument();

    fireEvent.click(bellButton);
    expect(screen.queryByTestId('notification-bell-dropdown')).not.toBeInTheDocument();
  });

  it('dropdown contiene NotificationList con notificaciones', () => {
    const notifications = [mockNotification, mockNotification2];
    render(
      <NotificationBell
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const bellButton = screen.getByTestId('notification-bell-button');
    fireEvent.click(bellButton);

    expect(screen.getByText('Nueva cita programada')).toBeInTheDocument();
    expect(screen.getByText('Paciente derivado')).toBeInTheDocument();
  });

  it('click en "Marcar como leída" delega onMarkAsRead(id)', () => {
    const notifications = [mockNotification];
    render(
      <NotificationBell
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const bellButton = screen.getByTestId('notification-bell-button');
    fireEvent.click(bellButton);

    const markButton = screen.getByRole('button', { name: /marcar como leída/i });
    fireEvent.click(markButton);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('badge actualiza cuando una notificación pasa a leido', () => {
    const initial = [mockNotification, mockNotification2];

    const { rerender } = render(
      <NotificationBell
        notifications={initial}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();

    const updated = [
      { ...mockNotification, estado: 'leido' as const },
      mockNotification2,
    ];

    rerender(
      <NotificationBell
        notifications={updated}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('cierra dropdown al click fuera', () => {
    const { container } = render(
      <div>
        <NotificationBell
          notifications={[mockNotification]}
          isLoading={false}
          onMarkAsRead={mockOnMarkAsRead}
        />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const bellButton = screen.getByTestId('notification-bell-button');
    fireEvent.click(bellButton);

    expect(screen.getByTestId('notification-bell-dropdown')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.click(outside);

    expect(screen.queryByTestId('notification-bell-dropdown')).not.toBeInTheDocument();
  });
});
