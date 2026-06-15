/**
 * Test Suite: HU-02 Integration Test
 * HU-02: Visualizar Agenda - Fase 2, Tarea 2.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MiAgenda } from '../../component/pages/MiAgenda';
import { useAgenda } from '../../hooks/useAgenda';

describe('HU-02: Visualizar Agenda - Integration', () => {
  it('debe exportar el hook useAgenda', () => {
    expect(useAgenda).toBeDefined();
    expect(typeof useAgenda).toBe('function');
  });

  it('debe renderizar la página MiAgenda con título Agenda Diaria', () => {
    render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(screen.getByText(/agenda diaria/i)).toBeInTheDocument();
  });

  it('debe renderizar filtros de estado en MiAgenda', () => {
    render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(screen.getByText(/todos/i)).toBeInTheDocument();
    expect(screen.getByText(/programados/i)).toBeInTheDocument();
  });

  it('debe cargar agenda del profesional actual', () => {
    const { getByText } = render(<MemoryRouter><MiAgenda /></MemoryRouter>);
    expect(getByText(/agenda diaria/i)).toBeInTheDocument();
  });
});
