import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DerivacionModal } from '../../component/derivacion/DerivacionModal';
import { Servicio } from '../../types';

const mockServicios: Servicio[] = [
  { id: 1, nombre: 'Medicina General', es_activo: true },
  { id: 2, nombre: 'Psicología', es_activo: true },
  { id: 3, nombre: 'Odontología', es_activo: true },
  { id: 4, nombre: 'Inactivo', es_activo: false },
];

describe('DerivacionModal Component', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar el modal con título de derivación', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByText(/derivar paciente/i)).toBeInTheDocument();
    });

    it('debe mostrar dropdown de servicios destino excluyendo el actual', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByLabelText(/servicio destino/i)).toBeInTheDocument();
      expect(screen.queryByText('Medicina General')).not.toBeInTheDocument();
      expect(screen.getByText('Psicología')).toBeInTheDocument();
    });

    it('debe mostrar solo servicios activos en el dropdown (RN-004)', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.queryByText('Inactivo')).not.toBeInTheDocument();
    });

    it('debe mostrar textarea para motivo de derivación (RN-011)', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
      expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    });
  });

  describe('Acciones', () => {
    it('debe ejecutar onSubmit con datos correctos al hacer clic en Derivar', async () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByLabelText(/servicio destino/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'Paciente requiere evaluación psicológica urgente.' } });

      fireEvent.click(screen.getByRole('button', { name: /derivar/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          cita_origen_id: 1,
          servicio_destino_id: 2,
          motivo: 'Paciente requiere evaluación psicológica urgente.',
        });
      });
    });

    it('debe ejecutar onCancel al hacer clic en Cancelar', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('debe deshabilitar botón Derivar si el motivo es muy corto (RN-011)', () => {
      render(
        <DerivacionModal
          citaId={1}
          servicioActualId={1}
          servicios={mockServicios}
          open={true}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.change(screen.getByLabelText(/motivo/i), { target: { value: 'Corto' } });
      const derivarBtn = screen.getByRole('button', { name: /derivar/i });
      expect(derivarBtn).toBeDisabled();
    });
  });
});
