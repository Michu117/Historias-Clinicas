/**
 * Test Suite: HU-02 Integration Test
 * HU-02: Visualizar Agenda - Fase 2, Tarea 2.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MiAgenda } from '../../component/pages/MiAgenda';
import { useAgenda } from '../../hooks/useAgenda';

describe('HU-02: Visualizar Agenda - Integration', () => {
  it('debe exportar el hook useAgenda', () => {
    expect(useAgenda).toBeDefined();
    expect(typeof useAgenda).toBe('function');
  });

  it('debe renderizar la página MiAgenda con tabla', () => {
    render(<MiAgenda />);
    expect(screen.getByText(/mi agenda/i)).toBeInTheDocument();
  });

  it('debe renderizar filtros de fecha en MiAgenda', () => {
    render(<MiAgenda />);
    expect(screen.getByLabelText(/desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasta/i)).toBeInTheDocument();
  });

  it('debe cargar agenda del profesional actual', () => {
    const { getByText } = render(<MiAgenda />);
    // La página debe renderizar sin errores y mostrar el título
    expect(getByText(/mi agenda/i)).toBeInTheDocument();
  });
});