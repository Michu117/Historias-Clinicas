import { useState, useEffect } from 'react';
import reportService from '../service/reportService';
import { validateReportFilter } from '../reportesValidators';
import { transformGenderDataToChart } from '../utils/chartTransformers';
import type { ReportFilter } from '../types';

interface DashboardState {
  loading: boolean;
  error: string | null;
  generalData: any;
  byDateData: any;
  byGenderData: any;
  tableData: any;
  kpis: {
    totalConsultas: number;
    consultasMedicina: number;
  } | null;
  serviciosData: any;
  donutChartData: any;
}

export function useReportesDashboard(filters: ReportFilter | null): DashboardState {
  const [state, setState] = useState<DashboardState>({
    loading: false,
    error: null,
    generalData: null,
    byDateData: null,
    byGenderData: null,
    tableData: null,
    kpis: null,
    serviciosData: null,
    donutChartData: null,
  });

  useEffect(() => {
    if (!filters) return;

    const validation = validateReportFilter(filters);
    if (!validation.isValid) {
      setState(prev => ({
        ...prev,
        error: validation.errors[0],
        loading: false,
      }));
      return;
    }

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [generalRes, byDateRes, byGenderRes, atencionesRes, serviciosRes] = await Promise.all([
          reportService.getGeneral(filters),
          reportService.getByDate(filters),
          reportService.getByGender(filters),
          reportService.getAtenciones(filters),
          reportService.getEstadisticas(filters),
        ]);

        const errors = [
          !generalRes.success && (generalRes.message || 'Error en reportes generales'),
          !byDateRes.success && (byDateRes.message || 'Error en reportes por fecha'),
          !byGenderRes.success && (byGenderRes.message || 'Error en reportes por género'),
          !atencionesRes.success && (atencionesRes.message || 'Error en detalle de atenciones'),
          !serviciosRes.success && (serviciosRes.message || 'Error en estadísticas por servicio'),
        ].filter(Boolean);

        if (errors.length > 0) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: errors.join('; '),
            generalData: null,
            byDateData: null,
            byGenderData: null,
            tableData: null,
            kpis: null,
            serviciosData: null,
            donutChartData: null,
          }));
          return;
        }

        const generalData = generalRes.data;
        const byDateData = byDateRes.data;
        const byGenderData = byGenderRes.data;
        const tableData = atencionesRes.data;
        const serviciosData = serviciosRes.data;

        const kpis = {
          totalConsultas: generalData?.total_consultas ?? 0,
          consultasMedicina: generalData?.consultas_medicina ?? 0,
        };

        const donutChartData = byGenderData
          ? transformGenderDataToChart(byGenderData, 'pie')
          : null;

        setState(prev => ({
          ...prev,
          loading: false,
          generalData,
          byDateData,
          byGenderData,
          tableData,
          serviciosData,
          kpis,
          donutChartData,
          error: null,
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message || 'Network error',
          generalData: null,
          byDateData: null,
          byGenderData: null,
          tableData: null,
          kpis: null,
          serviciosData: null,
          donutChartData: null,
        }));
      }
    };

    fetchData();
  }, [filters]);

  return {
    loading: state.loading,
    error: state.error,
    generalData: state.generalData,
    byDateData: state.byDateData,
    byGenderData: state.byGenderData,
    tableData: state.tableData,
    kpis: state.kpis,
    serviciosData: state.serviciosData,
    donutChartData: state.donutChartData,
  };
}
