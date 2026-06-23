import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotificationCenter } from '../component/NotificationCenter';
import { MemoryRouter } from 'react-router-dom';

describe('NotificationCenter', () => {
  it('renderiza título "Centro de Notificaciones"', () => {
    render(
      <MemoryRouter>
        <NotificationCenter />
      </MemoryRouter>
    );
    expect(screen.getByText('Centro de Notificaciones')).toBeInTheDocument();
  });
});
