/**
 * Test Suite: MiAgenda Page
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MiAgenda } from '../../component/pages/MiAgenda';

describe('MiAgenda Page', () => {
  it('debe renderizar página con título Mi Agenda', () => {
    render(<MiAgenda />);
    expect(screen.getByText(/mi agenda/i)).toBeInTheDocument();
  });

  it('debe renderizar AgendaFilters con date inputs', () => {
    render(<MiAgenda />);
    expect(screen.getByLabelText(/desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasta/i)).toBeInTheDocument();
  });

  it('debe renderizar tabla de citas', () => {
    render(<MiAgenda />);
    expect(screen.getByText(/tabla/i)).toBeInTheDocument();
  });
});