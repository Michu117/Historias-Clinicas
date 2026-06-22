/**
 * Test Suite: CitaRow Component
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CitaRow } from '../../component/agenda/CitaRow';
import { Cita } from '../../types';

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
  estado: 'AGENDADA',
  motivo: 'Consulta General',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('CitaRow Component', () => {
  it('debe renderizar fila con datos de cita', () => {
    const onClick = vi.fn();
    render(<CitaRow cita={mockCita} onClick={onClick} />);
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
  });

  it('debe ejecutar callback al hacer click', () => {
    const onClick = vi.fn();
    render(<CitaRow cita={mockCita} onClick={onClick} />);
    fireEvent.click(screen.getByText(/09:00/));
    expect(onClick).toHaveBeenCalledWith(mockCita);
  });
});