import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DerivacionInbox } from '../../component/derivacion/DerivacionInbox';
import { Derivacion, EstadoDerivacion } from '../../types';

const mockDerivacionesPendientes: Derivacion[] = [
  {
    id: 1,
    cita_origen_id: 10,
    profesional_origen_id: 101,
    servicio_destino_id: 2,
    profesional_destino_id: 102,
    motivo: 'Paciente requiere evaluación cardiológica.',
    estado: EstadoDerivacion.PENDIENTE,
    fecha_creacion: '2026-06-14T10:00:00Z',
  },
  {
    id: 2,
    cita_origen_id: 11,
    profesional_origen_id: 101,
    servicio_destino_id: 3,
    profesional_destino_id: 103,
    motivo: 'Evaluación psiquiátrica para paciente con ansiedad severa.',
    estado: EstadoDerivacion.PENDIENTE,
    fecha_creacion: '2026-06-14T11:00:00Z',
  },
];

describe('DerivacionInbox Component', () => {
  let mockOnAccept: ReturnType<typeof vi.fn>;
  let mockOnReject: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAccept = vi.fn();
    mockOnReject = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar título de bandeja de derivaciones', () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );
      expect(screen.getByText(/derivaciones pendientes/i)).toBeInTheDocument();
    });

    it('debe renderizar una tarjeta por cada derivación pendiente', () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );
      const cards = screen.getAllByTestId('derivacion-card');
      expect(cards.length).toBe(2);
    });

    it('debe mostrar mensaje de lista vacía cuando no hay derivaciones', () => {
      render(
        <DerivacionInbox
          derivaciones={[]}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );
      expect(screen.getByText(/no hay derivaciones pendientes/i)).toBeInTheDocument();
    });

    it('debe mostrar información de cada derivación: paciente, motivo, servicio origen, fecha', () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );
      expect(screen.getByText(/Paciente requiere evaluación cardiológica/i)).toBeInTheDocument();
      expect(screen.getByText(/Evaluación psiquiátrica para paciente con ansiedad severa/i)).toBeInTheDocument();
    });
  });

  describe('Acciones', () => {
    it('debe ejecutar onAccept al hacer clic en Aceptar en una tarjeta', async () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const acceptButtons = screen.getAllByRole('button', { name: /aceptar/i });
      fireEvent.click(acceptButtons[0]);

      await waitFor(() => {
        expect(mockOnAccept).toHaveBeenCalledWith(1);
      });
    });

    it('debe ejecutar onReject al hacer clic en Rechazar en una tarjeta', async () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const rejectButtons = screen.getAllByRole('button', { name: /rechazar/i });
      fireEvent.click(rejectButtons[0]);

      await waitFor(() => {
        expect(mockOnReject).toHaveBeenCalledWith(1);
      });
    });

    it('debe poder aceptar o rechazar cada derivación individualmente', async () => {
      render(
        <DerivacionInbox
          derivaciones={mockDerivacionesPendientes}
          onAccept={mockOnAccept}
          onReject={mockOnReject}
        />
      );

      const acceptButtons = screen.getAllByRole('button', { name: /aceptar/i });
      const rejectButtons = screen.getAllByRole('button', { name: /rechazar/i });

      expect(acceptButtons.length).toBe(2);
      expect(rejectButtons.length).toBe(2);

      fireEvent.click(acceptButtons[0]);
      fireEvent.click(rejectButtons[1]);

      await waitFor(() => {
        expect(mockOnAccept).toHaveBeenCalledWith(1);
        expect(mockOnReject).toHaveBeenCalledWith(2);
      });
    });
  });
});
