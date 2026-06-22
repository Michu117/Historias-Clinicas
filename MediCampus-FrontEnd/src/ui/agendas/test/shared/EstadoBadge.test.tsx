/**
 * Test Suite: EstadoBadge Component
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EstadoBadge } from '../../component/shared/EstadoBadge';

describe('EstadoBadge Component', () => {
  it('debe renderizar badge para AGENDADA', () => {
    render(<EstadoBadge estado="AGENDADA" />);
    expect(screen.getByText(/agendada/i)).toBeInTheDocument();
  });

  it('debe renderizar badge para ATENDIDA', () => {
    render(<EstadoBadge estado="ATENDIDA" />);
    expect(screen.getByText(/atendida/i)).toBeInTheDocument();
  });
});