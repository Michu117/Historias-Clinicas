/**
 * Test Suite: MiAgenda Page
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MiAgenda } from '../../component/pages/MiAgenda';

vi.mock('../../services/api/citaService', () => ({
  citaService: {
    listar: vi.fn().mockResolvedValue([]),
    obtener: vi.fn().mockResolvedValue({ id: 1, paciente_id: 1, estado: 'AGENDADA', motivo: 'test' }),
    crear: vi.fn(),
  },
}));

describe('MiAgenda Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar página con título Agenda Diaria', () => {
    render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(screen.getByText(/agenda diaria/i)).toBeInTheDocument();
  });

  it('debe renderizar filtros de estado', () => {
    render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(screen.getByText(/todos/i)).toBeInTheDocument();
    expect(screen.getByText(/programados/i)).toBeInTheDocument();
    expect(screen.getByText(/en curso/i)).toBeInTheDocument();
    expect(screen.getByText(/completados/i)).toBeInTheDocument();
  });

  it('debe renderizar buscador de pacientes', () => {
    render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/buscar paciente/i)).toBeInTheDocument();
  });
});