import { useState, useEffect } from 'react';
import reportService from '../service/reportService';
import { validateReportFilter } from '../reportesValidators';
import type { ReportFilter, Pagination } from '../types';

interface ServicioData {
  loading: boolean;
  error: string | null;
  filteredData: any[];
  pagination: Pagination | null;
}

export function useReportesServicio(
  servicioId: string,
  filters: ReportFilter | null,
  page: number = 1,
  pageSize: number = 10
): ServicioData {
  const [state, setState] = useState<ServicioData>({
    loading: false,
    error: null,
    filteredData: [],
    pagination: null
  });

  useEffect(() => {
    if (!servicioId || !filters) return;

    const validation = validateReportFilter(filters);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.errors[0],
        loading: false
      }));
      return;
    }

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await reportService.getAtenciones({
          ...filters,
          page,
          pageSize
        });

        if (!response.success) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: response.message || 'Error loading service data',
            filteredData: [],
            pagination: null
          }));
          return;
        }

        // Filtrar por servicioId si es necesario
        const rows = response.data?.rows || [];
        const filteredByService = rows.filter((r: any) => r.servicio_id === servicioId);

        setState(prev => ({
          ...prev,
          loading: false,
          filteredData: filteredByService,
          pagination: response.data?.pagination || { page, pageSize, total: filteredByService.length },
          error: null
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Network error',
          filteredData: [],
          pagination: null
        }));
      }
    };

    fetchData();
  }, [servicioId, filters, page, pageSize]);

  return state;
}

