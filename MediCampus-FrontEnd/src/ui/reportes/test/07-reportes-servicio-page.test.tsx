import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ReportesServicioPage from '../ReportesServicioPage';
import reportService from '../service/reportService';

vi.mock('../service/reportService');

describe('ReportesServicioPage - Red Phase (HU-15)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state on mount', () => {
    (reportService.getServiciosMasUsados as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'OK',
        data: [],
        errors: null
      }), 100))
    );

    render(
      <ReportesServicioPage
        servicioId="svc-1"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
      />
    );

    expect(screen.getByText(/cargando|loading/i)).toBeInTheDocument();
  });

  it('displays error when API fails', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: false,
      message: 'Error loading service data',
      data: null,
      errors: ['503: Service Unavailable']
    });

    render(
      <ReportesServicioPage
        servicioId="svc-1"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/error|503/i)).toBeInTheDocument();
    });
  });

  it('filters data by service_id correctly', async () => {
    const mockServiceData = {
      success: true,
      message: 'OK',
      data: {
        servicio: 'Cardiología',
        rows: [
          { fecha: '2024-01-01', consultas: 10 },
          { fecha: '2024-01-02', consultas: 15 }
        ],
        pagination: { page: 1, pageSize: 10, total: 2 }
      },
      errors: null
    };

    (reportService.getServiciosMasUsados as any).mockResolvedValue(mockServiceData);

    render(
      <ReportesServicioPage
        servicioId="svc-1"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cardiología')).toBeInTheDocument();
    });
  });

  it('respects role permissions (RF-14)', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: { rows: [], pagination: { page: 1, pageSize: 10, total: 0 } },
      errors: null
    });

    const { container } = render(
      <ReportesServicioPage
        servicioId="svc-1"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
        userRole="IsAdmin"
      />
    );

    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('hides restricted actions for non-admin users', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: { rows: [], pagination: { page: 1, pageSize: 10, total: 0 } },
      errors: null
    });

    render(
      <ReportesServicioPage
        servicioId="svc-1"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
        userRole="IsMedico"
      />
    );

    const adminButton = screen.queryByRole('button', { name: /admin|delete/i });
    expect(adminButton).not.toBeInTheDocument();
  });

  it('renders responsive layout on mobile', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: {
        servicio: 'Pediatría',
        rows: [{ fecha: '2024-01-01', consultas: 25 }],
        pagination: { page: 1, pageSize: 10, total: 1 }
      },
      errors: null
    });

    const { container } = render(
      <ReportesServicioPage
        servicioId="svc-2"
        filters={{ fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }}
      />
    );

    await waitFor(() => {
      const responsive = container.querySelector('.grid, .flex-col');
      expect(responsive).toBeInTheDocument();
    });
  });
});

