import { useState, useEffect, useCallback } from 'react';
import reportService from '../service/reportService';
import { validateReportFilter } from '../reportesValidators';
import type { ReportFilter } from '../types';

interface RangoItem {
  fecha: string;
  medica: number;
  psicologica: number;
  odontologica: number;
  social: number;
  total: number;
}

interface RangoState {
  loading: boolean;
  error: string | null;
  data: { items: RangoItem[]; total_consultas: number; total_dias: number } | null;
}

export function useReportesRango(filters: ReportFilter | null): RangoState {
  const [state, setState] = useState<RangoState>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!filters) return;

    const validation = validateReportFilter(filters);
    if (!validation.isValid) {
      setState({ loading: false, error: validation.errors[0], data: null });
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const res = await reportService.getConsultasRango(filters);

        if (cancelled) return;

        if (!res.success) {
          setState({ loading: false, error: res.message || 'Error al obtener consultas', data: null });
          return;
        }

        setState({ loading: false, error: null, data: res.data });
      } catch (err: any) {
        if (!cancelled) {
          setState({ loading: false, error: err.message || 'Error de red', data: null });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return state;
}
