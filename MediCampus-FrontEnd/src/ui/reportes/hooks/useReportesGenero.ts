import { useState, useEffect } from 'react';
import reportService from '../service/reportService';
import auditService from '../service/auditService';
import { validateReportFilter } from '../reportesValidators';
import { transformGenderDataToChart } from '../utils/chartTransformers';
import type { ReportFilter } from '../types';

interface GeneroReportState {
  loading: boolean;
  error: string | null;
  genderData: any;
  chartData: any;
  timestamp: string | null;
  queryDuration?: number;
}

export function useReportesGenero(filters: ReportFilter | null) {
  const [state, setState] = useState<GeneroReportState>({
    loading: false,
    error: null,
    genderData: null,
    chartData: null,
    timestamp: null,
    queryDuration: undefined
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

      // Inicia auditoría
      const queryId = auditService.startQuery('reporte_genero', filters);

      try {
        const response = await reportService.getConsultasPorGenero(filters);

        if (!response.success) {
          auditService.logError(queryId, response.message || 'API error');
          setState(prev => ({
            ...prev,
            loading: false,
            error: response.message || 'Error loading gender data',
            genderData: null,
            chartData: null,
            timestamp: null
          }));
          return;
        }

        const genderData = response.data;
        const chartData = transformGenderDataToChart(genderData, 'pie');
        const timestamp = new Date().toISOString();

        // Completa auditoría
        const auditEntry = auditService.completeQuery(queryId, genderData ? Object.keys(genderData).length : 0);

        setState(prev => ({
          ...prev,
          loading: false,
          genderData,
          chartData,
          timestamp,
          queryDuration: auditEntry?.duration,
          error: null
        }));
      } catch (err: any) {
        auditService.logError(queryId, err.message || 'Network error');
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Network error',
          genderData: null,
          chartData: null,
          timestamp: null
        }));
      }
    };

    fetchData();
  }, [filters]);

  return state;
}


