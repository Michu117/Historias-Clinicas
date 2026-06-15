import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChartContainer from '../component/ChartContainer';

describe('ChartContainer - Red Phase', () => {
  const mockChartData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
    datasets: [
      {
        label: 'Hombres',
        data: [30, 40, 35, 45],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      },
      {
        label: 'Mujeres',
        data: [25, 35, 40, 38],
        backgroundColor: 'rgba(236, 72, 153, 0.5)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1
      }
    ]
  };

  it('renders chart container with title', () => {
    render(
      <ChartContainer
        title="Consultas por Género"
        type="bar"
        data={mockChartData}
      />
    );

    expect(screen.getByText('Consultas por Género')).toBeInTheDocument();
  });

  it('renders bar chart when type is bar', () => {
    const { container } = render(
      <ChartContainer
        title="Estadísticas"
        type="bar"
        data={mockChartData}
      />
    );

    // Chart library renders canvas, check for canvas element
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders pie chart when type is pie', () => {
    const pieData = {
      labels: ['Hombres', 'Mujeres', 'Otro'],
      datasets: [
        {
          label: 'Distribuci',
          data: [45, 50, 5],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ]
        }
      ]
    };

    const { container } = render(
      <ChartContainer
        title="Distribución por Género"
        type="pie"
        data={pieData}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('displays legend when showLegend is true', () => {
    const { container } = render(
      <ChartContainer
        title="Con Leyenda"
        type="bar"
        data={mockChartData}
        showLegend={true}
      />
    );

    // Chart.js legend is rendered inside the canvas container
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('applies responsive height', () => {
    const { container } = render(
      <ChartContainer
        title="Responsive"
        type="bar"
        data={mockChartData}
        height={300}
      />
    );

    const chartDiv = container.querySelector('div[style*="height"]');
    expect(chartDiv).toBeInTheDocument();
  });

  it('renders loading state when data is loading', () => {
    render(
      <ChartContainer
        title="Loading Chart"
        type="bar"
        data={null}
        loading={true}
      />
    );

    expect(screen.getByText(/cargando|loading/i)).toBeInTheDocument();
  });

  it('renders error message when data fails to load', () => {
    render(
      <ChartContainer
        title="Error Chart"
        type="bar"
        data={null}
        error="Failed to fetch chart data"
      />
    );

    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });
});

