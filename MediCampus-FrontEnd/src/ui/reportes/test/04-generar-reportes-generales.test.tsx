import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import GenerarReportesGenerales from '../GenerarReportesGenerales';
import reportService from '../service/reportService';

vi.mock('../service/reportService');

describe('GenerarReportesGenerales - Red Phase (Simulating API failures)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error state when GET /api/v1/reportes/atenciones/ fails', async () => {
    (reportService.getAtenciones as any).mockResolvedValueOnce({
      success: false,
      message: 'Server error',
      data: null,
      errors: ['500: Internal Server Error']
    });

    render(<GenerarReportesGenerales />);

    await waitFor(() => {
      expect(screen.getByText(/error|fallo/i)).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    (reportService.getAtenciones as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'OK',
        data: { rows: [] },
        errors: null
      }), 100))
    );

    render(<GenerarReportesGenerales />);
    expect(screen.getByText(/cargando|loading/i)).toBeInTheDocument();
  });

  it('renders KPIs section when data loads successfully', async () => {
    (reportService.getAtenciones as any).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: {
        rows: [
          { id: '1', fecha: '2024-01-01', total_consultas: 50 },
          { id: '2', fecha: '2024-01-02', total_consultas: 60 }
        ],
        pagination: { page: 1, pageSize: 10, total: 2 }
      },
      errors: null
    });

    render(<GenerarReportesGenerales />);

    await waitFor(() => {
      expect(screen.getByText(/kpi|métricas|estadísticas/i)).toBeInTheDocument();
    });
  });

  it('handles network timeout gracefully', async () => {
    (reportService.getAtenciones as any).mockResolvedValueOnce({
      success: false,
      message: 'Network timeout',
      data: null,
      errors: ['TIMEOUT']
    });

    render(<GenerarReportesGenerales />);

    await waitFor(() => {
      expect(screen.getByText(/timeout|error de conexión/i)).toBeInTheDocument();
    });
  });

  it('renders reset button to retry failed request', async () => {
    (reportService.getAtenciones as any).mockResolvedValueOnce({
      success: false,
      message: 'Error',
      data: null,
      errors: ['Network error']
    });

    render(<GenerarReportesGenerales />);

    await waitFor(() => {
      const retryBtn = screen.getByRole('button', { name: /reintentar|retry/i });
      expect(retryBtn).toBeInTheDocument();
    });
  });
});

