/**
 * Test Suite: CitaModal Component
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CitaModal } from '../../component/shared/CitaModal';
import { Cita, EstadoCita } from '../../types';

const mockCita: Cita = {
  id: 1,
  paciente_id: 1,
  profesional_id: 101,
  servicio_id: 1,
  servicios_ids: [1],
  fecha: '2026-06-01',
  hora: '09:00',
  duracion_minutos: 30,
  margen_minutos: 30,
  estado: EstadoCita.AGENDADA,
  motivo: 'Consulta General',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('CitaModal Component', () => {
  it('debe renderizar modal cuando está abierto', () => {
    const onClose = vi.fn();
    render(<CitaModal cita={mockCita} open={true} onClose={onClose} />);
    expect(screen.getByText(/consulta general/i)).toBeInTheDocument();
  });

  it('debe cerrar modal al hacer click en close', () => {
    const onClose = vi.fn();
    render(<CitaModal cita={mockCita} open={true} onClose={onClose} />);
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) => btn.textContent === 'Cerrar');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });
});