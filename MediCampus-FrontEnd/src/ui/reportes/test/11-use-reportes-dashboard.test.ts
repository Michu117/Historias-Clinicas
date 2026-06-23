import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useReportesDashboard } from '../hooks/useReportesDashboard';

vi.mock('../service/reportService', () => ({
  default: {
    getGeneral: vi.fn(),
    getByDate: vi.fn(),
    getByGender: vi.fn(),
    getAtenciones: vi.fn(),
  },
}));

import reportService from '../service/reportService';

const mockFilter = {
  fecha_inicio: '2025-01-01',
  fecha_fin: '2025-12-31',
  dateRange: 'year' as const,
  servicioId: null,
};

describe('useReportesDashboard - QA Ciclo de Carga y Error', () => {

  it('inicia con loading=false y error=null', () => {
    const { result } = renderHook(() => useReportesDashboard(null));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('establece loading=true al aplicar filtros', async () => {
    vi.mocked(reportService.getGeneral).mockResolvedValue({
      success: true, message: 'ok', data: { total_consultas: 100, consultas_medicina: 50 }, errors: null,
    });
    vi.mocked(reportService.getByDate).mockResolvedValue({
      success: true, message: 'ok', data: { days: [{ day: 'Lun', count: 10 }] }, errors: null,
    });
    vi.mocked(reportService.getByGender).mockResolvedValue({
      success: true, message: 'ok', data: { male: { count: 10, percent: 50 }, female: { count: 10, percent: 50 } }, errors: null,
    });
    vi.mocked(reportService.getAtenciones).mockResolvedValue({
      success: true, message: 'ok', data: { rows: [] }, errors: null,
    });

    const { result, rerender } = renderHook((f: any) => useReportesDashboard(f), { initialProps: null as any });
    expect(result.current.loading).toBe(false);

    rerender(mockFilter);
    await waitFor(() => expect(result.current.loading).toBe(true));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.kpis).toEqual({ totalConsultas: 100, consultasMedicina: 50 });
  });

  it('limpia el error al iniciar una nueva carga', async () => {
    vi.mocked(reportService.getGeneral).mockRejectedValue(new Error('Network error'));

    const { result, rerender } = renderHook((f: any) => useReportesDashboard(f), { initialProps: null as any });

    rerender(mockFilter);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();

    vi.mocked(reportService.getGeneral).mockResolvedValue({
      success: true, message: 'ok', data: { total_consultas: 100, consultas_medicina: 50 }, errors: null,
    });
    vi.mocked(reportService.getByDate).mockResolvedValue({
      success: true, message: 'ok', data: { days: [] }, errors: null,
    });
    vi.mocked(reportService.getByGender).mockResolvedValue({
      success: true, message: 'ok', data: { male: { count: 0, percent: 0 }, female: { count: 0, percent: 0 } }, errors: null,
    });
    vi.mocked(reportService.getAtenciones).mockResolvedValue({
      success: true, message: 'ok', data: { rows: [] }, errors: null,
    });

    rerender({ ...mockFilter });
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.kpis).toEqual({ totalConsultas: 100, consultasMedicina: 50 });
  });

  it('maneja error de una sola API sin bloquear el dashboard', async () => {
    vi.mocked(reportService.getGeneral).mockResolvedValue({
      success: true, message: 'ok', data: { total_consultas: 100, consultas_medicina: 50 }, errors: null,
    });
    vi.mocked(reportService.getByDate).mockResolvedValue({
      success: false, message: 'Error en reportes por fecha', data: null, errors: ['fail'],
    });
    vi.mocked(reportService.getByGender).mockResolvedValue({
      success: true, message: 'ok', data: { male: { count: 10, percent: 50 } }, errors: null,
    });
    vi.mocked(reportService.getAtenciones).mockResolvedValue({
      success: true, message: 'ok', data: { rows: [] }, errors: null,
    });

    const { result, rerender } = renderHook((f: any) => useReportesDashboard(f), { initialProps: null as any });
    rerender(mockFilter);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('Error en reportes por fecha');
    expect(result.current.kpis).toBeNull();
  });
});
