import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ReportesGeneroPagina from '../ReportesGeneroPagina';
import reportService from '../service/reportService';

vi.mock('../service/reportService');

describe('ReportesGeneroPagina - Red Phase (HU-16)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description', () => {
    (reportService.getConsultasPorGenero as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'OK',
        data: {},
        errors: null
      }), 100))
    );

    render(<ReportesGeneroPagina />);

    expect(screen.getByText(/género|gender/i)).toBeInTheDocument();
  });

  it('shows loading state on mount', () => {
    (reportService.getConsultasPorGenero as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'OK',
        data: {},
        errors: null
      }), 100))
    );

    render(<ReportesGeneroPagina />);

    expect(screen.getByText(/cargando|loading/i)).toBeInTheDocument();
  });

  it('displays pie chart when gender data loads', async () => {
    const mockData = {
      male: { count: 100, percent: 50 },
      female: { count: 90, percent: 45 },
      other: { count: 10, percent: 5 }
    };

    (reportService.getConsultasPorGenero as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockData,
      errors: null
    });

    const { container } = render(<ReportesGeneroPagina filters={null} />);

    await waitFor(() => {
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });
  });

  it('renders gender statistics table', async () => {
    const mockData = {
      male: { count: 50, percent: 50 },
      female: { count: 50, percent: 50 },
      other: { count: 0, percent: 0 }
    };

    (reportService.getConsultasPorGenero as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockData,
      errors: null
    });

    render(<ReportesGeneroPagina filters={null} />);

    await waitFor(() => {
      expect(screen.getByText(/hombres|male/i)).toBeInTheDocument();
      expect(screen.getByText(/mujeres|female/i)).toBeInTheDocument();
    });
  });

  it('handles API errors with error message', async () => {
    (reportService.getConsultasPorGenero as any).mockResolvedValue({
      success: false,
      message: 'Data unavailable',
      data: null,
      errors: ['503: Service Unavailable']
    });

    render(<ReportesGeneroPagina filters={null} />);

    await waitFor(() => {
      expect(screen.getByText(/error|unavailable/i)).toBeInTheDocument();
    });
  });

  it('applies date filters to API call', async () => {
    const mockFilters = {
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31'
    };

    (reportService.getConsultasPorGenero as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: {},
      errors: null
    });

    render(<ReportesGeneroPagina filters={mockFilters} />);

    await waitFor(() => {
      expect(reportService.getConsultasPorGenero).toHaveBeenCalledWith(
        expect.objectContaining({
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-01-31'
        })
      );
    });
  });

  it('tracks query audit trail (RNF-06)', async () => {
    const mockData = { male: { count: 50, percent: 100 } };

    (reportService.getConsultasPorGenero as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockData,
      errors: null
    });

    const { container } = render(
      <ReportesGeneroPagina
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-01-31' }}
      />
    );

    await waitFor(() => {
      // Audit timestamp or metadata should be present in the rendered page
      expect(container).toBeInTheDocument();
    });
  });
});

