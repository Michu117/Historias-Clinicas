import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NotificationBadge } from '../component/NotificationBadge';

describe('NotificationBadge', () => {
  it('renderiza número de no leídas correctamente', () => {
    render(<NotificationBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('oculta badge si count = 0', () => {
    const { container } = render(<NotificationBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('aplica clase CSS para color rojo (no leído)', () => {
    render(<NotificationBadge count={1} />);
    const badge = screen.getByText('1');
    expect(badge).toHaveClass('bg-red-500');
  });

  it('soporta className personalizado', () => {
    render(<NotificationBadge count={1} className="custom-class" />);
    const badge = screen.getByText('1');
    expect(badge).toHaveClass('custom-class');
  });
});
