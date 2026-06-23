import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReportesServicio } from '../hooks/useReportesServicio';
import reportService from '../service/reportService';

vi.mock('../service/reportService');

describe('useReportesServicio Hook - Red Phase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    (reportService.getServiciosMasUsados as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        success: true,
        message: 'OK',
        data: [],
        errors: null
      }), 100))
    );

    const { result } = renderHook(() =>
      useReportesServicio('svc-1', { fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }, 1, 10)
    );

    expect(result.current.loading).toBe(true);
  });

  it('filters data by service_id', async () => {
    const mockData = [
      { id: 'svc-1', nombre: 'Cardiología', total: 50 },
      { id: 'svc-2', nombre: 'Pediatría', total: 30 }
    ];

    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockData,
      errors: null
    });

    const { result } = renderHook(() =>
      useReportesServicio('svc-1', { fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }, 1, 10)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.filteredData).toBeDefined();
  });

  it('handles pagination parameters', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: true,
      message: 'OK',
      data: { rows: [], pagination: { page: 2, pageSize: 20, total: 100 } },
      errors: null
    });

    const { result } = renderHook(() =>
      useReportesServicio('svc-1', { fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }, 2, 20)
    );

    await waitFor(() => {
      expect(result.current.pagination?.page).toBe(2);
    });
  });

  it('handles API errors gracefully', async () => {
    (reportService.getServiciosMasUsados as any).mockResolvedValue({
      success: false,
      message: 'Service unavailable',
      data: null,
      errors: ['500: Server error']
    });

    const { result } = renderHook(() =>
      useReportesServicio('svc-1', { fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' }, 1, 10)
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

