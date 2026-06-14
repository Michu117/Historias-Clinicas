import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DerivacionCard } from '../../component/derivacion/DerivacionCard';
import { Derivacion, EstadoDerivacion } from '../../types';

const mockDerivacion: Derivacion = {
  id: 1,
  cita_origen_id: 10,
  profesional_origen_id: 101,
  servicio_destino_id: 2,
  profesional_destino_id: 102,
  motivo: 'Paciente requiere evaluación cardiológica por dolor en el pecho.',
  estado: EstadoDerivacion.PENDIENTE,
  fecha_creacion: '2026-06-14T10:00:00Z',
};

describe('DerivacionCard Component', () => {
  let mockOnAceptar: ReturnType<typeof vi.fn>;
  let mockOnRechazar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnAceptar = vi.fn();
    mockOnRechazar = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar la tarjeta con información de la derivación', () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );
      expect(screen.getByText(mockDerivacion.motivo)).toBeInTheDocument();
      expect(screen.getByText(/pendiente/i)).toBeInTheDocument();
    });

    it('debe mostrar el motivo de la derivación (RN-011)', () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );
      expect(screen.getByText(/Paciente requiere evaluación cardiológica/i)).toBeInTheDocument();
    });

    it('debe mostrar la fecha de creación formateada', () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );
      expect(screen.getByText(/2026/i)).toBeInTheDocument();
    });

    it('debe mostrar badge con el estado de la derivación', () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });
  });

  describe('Acciones', () => {
    it('debe ejecutar onAceptar al hacer clic en Aceptar', async () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /aceptar/i }));

      await waitFor(() => {
        expect(mockOnAceptar).toHaveBeenCalledWith(mockDerivacion.id);
      });
    });

    it('debe ejecutar onRechazar al hacer clic en Rechazar', async () => {
      render(
        <DerivacionCard
          derivacion={mockDerivacion}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /rechazar/i }));

      await waitFor(() => {
        expect(mockOnRechazar).toHaveBeenCalledWith(mockDerivacion.id);
      });
    });

    it('debe mostrar los botones Aceptar y Rechazar solo si estado es PENDIENTE', () => {
      const derivacionAceptada = { ...mockDerivacion, estado: EstadoDerivacion.ACEPTADA };
      render(
        <DerivacionCard
          derivacion={derivacionAceptada}
          onAceptar={mockOnAceptar}
          onRechazar={mockOnRechazar}
        />
      );

      expect(screen.queryByRole('button', { name: /aceptar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /rechazar/i })).not.toBeInTheDocument();
    });
  });
});
