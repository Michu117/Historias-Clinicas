/**
 * Test Suite: AgendaFilters Component
 * HU-02: Visualizar Agenda
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgendaFilters } from '../../component/agenda/AgendaFilters';

describe('AgendaFilters Component', () => {
  it('debe renderizar date pickers desde y hasta', () => {
    const onFilterChange = vi.fn();
    render(
      <AgendaFilters
        onFilterChange={onFilterChange}
        defaultDates={{ desde: '2026-06-01', hasta: '2026-06-15' }}
      />
    );
    expect(screen.getByLabelText(/desde/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasta/i)).toBeInTheDocument();
  });

  it('debe ejecutar onFilterChange al aplicar filtro', () => {
    const onFilterChange = vi.fn();
    render(
      <AgendaFilters
        onFilterChange={onFilterChange}
        defaultDates={{ desde: '2026-06-01', hasta: '2026-06-15' }}
      />
    );
    const button = screen.getByRole('button', { name: /filtrar/i });
    fireEvent.click(button);
    expect(onFilterChange).toHaveBeenCalled();
  });
});