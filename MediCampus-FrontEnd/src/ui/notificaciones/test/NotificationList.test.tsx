import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NotificationList } from '../component/NotificationList';
import { INotification } from '../types';

describe('NotificationList', () => {
  const mockNotificationCita: INotification = {
    id: '1',
    tipo: 'cita',
    mensaje: 'Nueva cita programada para el 2026-06-15 a las 10:00 AM',
    estado: 'no_leido',
    timestamp: '2026-06-10T14:30:00Z',
  };

  const mockNotificationCita2: INotification = {
    id: '2',
    tipo: 'cita',
    mensaje: 'Tu cita ha sido reprogramada a 2026-06-20',
    estado: 'no_leido',
    timestamp: '2026-06-11T09:15:00Z',
  };

  const mockNotificationDerivacion: INotification = {
    id: '3',
    tipo: 'derivacion',
    mensaje: 'Paciente derivado a tu servicio. Motivo: evaluación cardiológica',
    estado: 'no_leido',
    timestamp: '2026-06-09T16:45:00Z',
  };

  const mockNotificationDerivacion2: INotification = {
    id: '4',
    tipo: 'derivacion',
    mensaje: 'Nuevo caso derivado: seguimiento post-operatorio',
    estado: 'no_leido',
    timestamp: '2026-06-08T11:20:00Z',
  };

  const mockOnMarkAsRead = vi.fn();

  beforeEach(() => {
    mockOnMarkAsRead.mockClear();
  });

  it('renderiza un array de notificaciones usando NotificationCard', () => {
    const notifications = [mockNotificationCita];
    render(
      <NotificationList
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('Nueva cita programada para el 2026-06-15 a las 10:00 AM')).toBeInTheDocument();
  });

  it('muestra múltiples notificaciones correctamente', () => {
    const notifications = [mockNotificationCita, mockNotificationDerivacion];
    render(
      <NotificationList
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('Nueva cita programada para el 2026-06-15 a las 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Paciente derivado a tu servicio. Motivo: evaluación cardiológica')).toBeInTheDocument();
  });

  it('ordena las notificaciones por timestamp descendente, mostrando primero la más reciente', () => {
    const notifications = [mockNotificationCita, mockNotificationCita2, mockNotificationDerivacion];

    const { container } = render(
      <NotificationList
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const notificationCards = container.querySelectorAll('[data-testid="notification-card"]');

    expect(notificationCards[0]).toHaveTextContent("Tu cita ha sido reprogramada a 2026-06-20");
    expect(notificationCards[1]).toHaveTextContent("Nueva cita programada para el 2026-06-15 a las 10:00 AM");
    expect(notificationCards[2]).toHaveTextContent("Paciente derivado a tu servicio. Motivo: evaluación cardiológica");
  });

  it('muestra estado de carga cuando isLoading = true', () => {
    render(
      <NotificationList
        notifications={[]}
        isLoading={true}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByTestId('notification-list-loading')).toBeInTheDocument();
  });

  it('muestra el mensaje "No tienes notificaciones" cuando el array está vacío', () => {
    render(
      <NotificationList
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('muestra un mensaje de error cuando existe la prop error', () => {
    const errorMessage = 'Error al cargar las notificaciones';
    render(
      <NotificationList
        notifications={[]}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('al hacer click en "Marcar como leída", delega correctamente el id hacia onMarkAsRead(id)', () => {
    const notifications = [mockNotificationCita, mockNotificationDerivacion];
    render(
      <NotificationList
        notifications={notifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /marcar como leída/i });

    fireEvent.click(buttons[0]);
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');

    fireEvent.click(buttons[1]);
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('3');

    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(2);
  });

  it('cubre HU-12: renderiza múltiples notificaciones de cita correctamente', () => {
    const citaNotifications = [mockNotificationCita, mockNotificationCita2];
    render(
      <NotificationList
        notifications={citaNotifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const citaLabels = screen.getAllByText(/^Cita$/i);
    expect(citaLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('Nueva cita programada para el 2026-06-15 a las 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Tu cita ha sido reprogramada a 2026-06-20')).toBeInTheDocument();
  });

  it('cubre HU-13: renderiza múltiples notificaciones de derivación correctamente', () => {
    const derivacionNotifications = [mockNotificationDerivacion, mockNotificationDerivacion2];
    render(
      <NotificationList
        notifications={derivacionNotifications}
        isLoading={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const derivacionLabels = screen.getAllByText(/^Derivación$/i);
    expect(derivacionLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('Paciente derivado a tu servicio. Motivo: evaluación cardiológica')).toBeInTheDocument();
    expect(screen.getByText('Nuevo caso derivado: seguimiento post-operatorio')).toBeInTheDocument();
  });
});
