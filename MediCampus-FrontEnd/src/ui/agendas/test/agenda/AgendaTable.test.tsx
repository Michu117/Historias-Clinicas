/**
 * Test Suite: AgendaTable Component
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgendaTable } from '../../component/agenda/AgendaTable';
import { Cita } from '../../types';

const mockCitas: Cita[] = [
  {
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
  },
];

describe('AgendaTable Component', () => {
  it('debe renderizar tabla con filas de citas', () => {
    const onClickRow = vi.fn();
    render(<AgendaTable citas={mockCitas} onClickRow={onClickRow} loading={false} />);
    expect(screen.getByText(/09:00/)).toBeInTheDocument();
  });

  it('debe ejecutar onClickRow cuando se hace click en una fila', () => {
    const onClickRow = vi.fn();
    render(<AgendaTable citas={mockCitas} onClickRow={onClickRow} loading={false} />);
    const row = screen.getByText(/09:00/);
    fireEvent.click(row);
    expect(onClickRow).toHaveBeenCalled();
  });

  it('debe mostrar loading cuando está cargando', () => {
    const onClickRow = vi.fn();
    render(<AgendaTable citas={[]} onClickRow={onClickRow} loading={true} />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
});