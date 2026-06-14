import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricCard from '../component/MetricCard';

describe('MetricCard', () => {
  it('renders value and label', () => {
    render(<MetricCard value={123} label="Total consultas" />);
    expect(screen.getByText('123')).toBeInTheDocument();
    expect(screen.getByText('Total consultas')).toBeInTheDocument();
  });

  it('renders delta indicator', () => {
    render(<MetricCard value={456} label="Atenciones" delta={15} />);
    expect(screen.getByText('456')).toBeInTheDocument();
  });

  it('applies trend styling', () => {
    const { container } = render(
      <MetricCard value={100} label="KPI" trend="down" />
    );
    expect(container.firstChild).toHaveClass('trend-down');
  });
});

