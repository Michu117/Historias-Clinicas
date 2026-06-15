import { useState, useEffect } from 'react';
import reportService from '../service/reportService';
import { validateReportFilter, calculateDelta } from '../reportesValidators';
import type { ReportFilter, ApiWrapper } from '../types';

interface ReportesGeneralesState {
  loading: boolean;
  error: string | null;
  data: any;
  kpis: {
    totalConsultas: number;
    consultasPromedioDia: number;
    diagnosticosFrecuentes: string[];
    serviciosMasUsados: string[];
  } | null;
}

export function useReportesGenerales(filters: ReportFilter | null) {
  const [state, setState] = useState<ReportesGeneralesState>({
    loading: false,
    error: null,
    data: null,
    kpis: null
  });

  useEffect(() => {
    if (!filters) return;

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
        const response = await reportService.getAtenciones(filters);

        if (!response.success) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: response.message || 'Error loading data',
            data: null,
            kpis: null
          }));
          return;
        }

        // Procesar datos para KPIs
        const rows = response.data?.rows || [];
        const totalConsultas = rows.length;
        const dias = new Set(rows.map((r: any) => r.fecha)).size || 1;
        const consultasPromedioDia = Math.round(totalConsultas / dias);

        // Simular cálculo de diagnósticos y servicios frecuentes
        const diagnosticos = [...new Set(rows.map((r: any) => r.diagnostico))].slice(0, 5);
        const servicios = [...new Set(rows.map((r: any) => r.servicio))].slice(0, 5);

        const kpis = {
          totalConsultas,
          consultasPromedioDia,
          diagnosticosFrecuentes: diagnosticos,
          serviciosMasUsados: servicios
        };

        setState(prev => ({
          ...prev,
          loading: false,
          data: response.data,
          kpis,
          error: null
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Network error',
          data: null,
          kpis: null
        }));
      }
    };

    fetchData();
  }, [filters]);

  return state;
}

