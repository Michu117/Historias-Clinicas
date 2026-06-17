import axios, { AxiosInstance } from 'axios';
import { ApiWrapper, ReportFilter, ServicioRef, ReportTableRow, Pagination } from '../types';
const BASE_URL = '/backend/api/v1/reportes';
const REQUEST_TIMEOUT = 10000;
const USE_MOCKS = false; // poner true para desarrollo offline

function formatErrorToWrapper(err: any): ApiWrapper {
  const message = err?.message || 'Unknown error';
  if (err && err.response && err.response.data) {
    const d = err.response.data;
    return {
      success: d.success === undefined ? false : Boolean(d.success),
      message: d.message || message,
      data: d.data || null,
      errors: d.errors || [message]
    };
  }
  return { success: false, message, data: null, errors: [message] };
}

class ReportService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: BASE_URL, timeout: REQUEST_TIMEOUT });

    // Request interceptor - add JWT token if present
    this.client.interceptors.request.use((config: any) => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers = config.headers || {};
          (config.headers as any)['Authorization'] = `Bearer ${token}`;
        }
        (config.headers as any)['Cache-Control'] = 'no-cache';
        (config.headers as any)['Pragma'] = 'no-cache';
      } catch (e) {
        // ignore localStorage errors in some test envs
      }
      return config;
    }, (error: any) => Promise.reject(error));

    // Response interceptor - normalize wrapper
    this.client.interceptors.response.use((response: any) => response, (error: any) => Promise.reject(error));
  }

  async getEstadisticas(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({ success: true, message: 'mock', data: { total_consultas: 42 }, errors: null });
    }
    try {
      const params = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      const res = await this.client.get('/estadisticas/', { params }) as any;
      const d = res?.data;
      if (d && typeof d === 'object' && 'success' in d) return d as ApiWrapper;
      return { success: true, message: 'ok', data: d, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getServiciosMasUsados(filter: ReportFilter): Promise<ApiWrapper<ServicioRef[]>> {
    if (USE_MOCKS) {
      return Promise.resolve({ success: true, message: 'mock', data: [{ id: 'svc-1', nombre: 'Cardiología' }], errors: null });
    }
    try {
      const params = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      const res = await this.client.get('/servicios-mas-usados/', { params }) as any;
      const d = res?.data;
      if (d && typeof d === 'object' && 'success' in d) return d as ApiWrapper<ServicioRef[]>;
      return { success: true, message: 'ok', data: d as ServicioRef[], errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getConsultasPorGenero(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({ success: true, message: 'mock', data: { male: { count: 10, percent: 50 }, female: { count: 10, percent: 50 }, other: { count: 0, percent: 0 } }, errors: null });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      const res = await this.client.get('/consultas-por-genero/', { params }) as any;
      const d = res?.data;
      const source = d?.data ?? d;

      const normalized = Array.isArray(source?.items)
        ? source.items.reduce((acc: Record<string, { count: number; percent: number }>, item: any) => {
            const key = item.genero === 'hombre' ? 'male' : item.genero === 'mujer' ? 'female' : 'other';
            acc[key] = {
              count: Number(item.cantidad ?? 0),
              percent: Number(item.porcentaje ?? 0)
            };
            return acc;
          }, {
            male: { count: 0, percent: 0 },
            female: { count: 0, percent: 0 },
            other: { count: 0, percent: 0 }
          })
        : source;

      return { success: true, message: 'ok', data: normalized, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getAtenciones(filter: ReportFilter & Partial<Pagination>): Promise<ApiWrapper<{ rows: ReportTableRow[]; pagination?: Pagination }>> {
    if (USE_MOCKS) {
      return Promise.resolve({ success: true, message: 'mock', data: { rows: [], pagination: { page: 1, pageSize: 10, total: 0 } }, errors: null });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      if (filter.page) params.page = filter.page;
      if (filter.pageSize) params.pageSize = filter.pageSize;
      const res = await this.client.get('/atenciones/', { params }) as any;
      const d = res?.data;
      const source = d?.data ?? d;

      const sourceRows = Array.isArray(source?.por_tipo_servicio)
        ? source.por_tipo_servicio
        : Array.isArray(source?.rows)
          ? source.rows
          : [];

      const rows: ReportTableRow[] = sourceRows.map((item: any) => ({
        id: String(item.tipo ?? item.servicio ?? item.id ?? crypto.randomUUID?.() ?? Math.random()),
        fecha: `${filter.fecha_inicio || ''}${filter.fecha_fin ? ` al ${filter.fecha_fin}` : ''}`,
        servicio: item.tipo || item.servicio || '-',
        profesional: '-',
        genero: undefined,
        total_consultas: Number(item.cantidad ?? item.total_consultas ?? 0),
        consultas: Number(item.cantidad ?? item.total_consultas ?? 0),
        cantidad: Number(item.cantidad ?? item.total_consultas ?? 0)
      }));

      return {
        success: true,
        message: 'ok',
        data: {
          rows,
          pagination: source?.pagination || { page: filter.page || 1, pageSize: filter.pageSize || rows.length || 10, total: rows.length },
          total_atenciones: source?.total_atenciones ?? rows.reduce((sum: number, row: any) => sum + Number(row.total_consultas || 0), 0),
          por_tipo_servicio: source?.por_tipo_servicio || rows,
          filtros_aplicados: source?.filtros_aplicados || null
        } as any,
        errors: null
      };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getGeneral(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({
        success: true,
        message: 'mock',
        data: {
          total_consultas: 1250,
          consultas_medicina: 580,
        },
        errors: null
      });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      const res = await this.client.get('/estadisticas/', { params }) as any;
      const data: any[] = res?.data ?? [];
      const servicios = Array.isArray(data) ? data : [];
      const total_consultas = servicios.reduce((sum: number, s: any) => sum + (s.total || 0), 0);
      const medicinaEntry = servicios.find((s: any) =>
        s.servicio === 'Médica'
      );
      return {
        success: true,
        message: 'ok',
        data: {
          total_consultas,
          consultas_medicina: medicinaEntry?.total ?? 0,
        },
        errors: null,
      };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getByDate(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({
        success: true,
        message: 'mock',
        data: {
          days: [
            { day: 'Lun', count: 45 },
            { day: 'Mar', count: 62 },
            { day: 'Mié', count: 38 },
            { day: 'Jue', count: 71 },
            { day: 'Vie', count: 55 },
            { day: 'Sáb', count: 20 },
            { day: 'Dom', count: 15 },
          ]
        },
        errors: null
      });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      const res = await this.client.get('/atenciones/', { params }) as any;
      const d = res?.data;
      const source = d?.data ?? d;
      const porTipoServicio = source?.por_tipo_servicio ?? [];
      const days = porTipoServicio.map((item: any) => ({
        day: item.tipo ?? 'Sin tipo',
        count: item.cantidad ?? 0,
      }));
      return { success: true, message: 'ok', data: { days }, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getByGender(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({
        success: true,
        message: 'mock',
        data: {
          male: { count: 525, percent: 42 },
          female: { count: 625, percent: 50 },
          other: { count: 100, percent: 8 },
        },
        errors: null
      });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      const res = await this.client.get('/consultas-por-genero/', { params }) as any;
      const d = res?.data;
      const source = d?.data ?? d;
      const items = source?.items ?? [];
      const normalized: Record<string, { count: number; percent: number }> = {
        male: { count: 0, percent: 0 },
        female: { count: 0, percent: 0 },
        other: { count: 0, percent: 0 },
      };
      items.forEach((item: any) => {
        const key = item.genero === 'hombre' ? 'male' : item.genero === 'mujer' ? 'female' : 'other';
        normalized[key] = {
          count: Number(item.cantidad ?? 0),
          percent: Number(item.porcentaje ?? 0),
        };
      });
      return { success: true, message: 'ok', data: normalized, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  // Export report (server-side). Returns ApiWrapper which may contain:
  // - data.url (direct download)
  // - data.request_id + status === 'queued' for async exports
  async export(payload: any): Promise<ApiWrapper> {
    try {
      const res = await this.client.post('/export/', payload) as any;
      const d = res?.data;
      if (d && typeof d === 'object' && 'success' in d) return d as ApiWrapper;
      return { success: true, message: 'ok', data: d, errors: null } as ApiWrapper;
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  // Download export as blob (binary). Triggers browser download directly.
  // Returns ApiWrapper with filename on success.
  async downloadExport(payload: any): Promise<ApiWrapper> {
    try {
      const res = await this.client.post('/export/', payload, {
        responseType: 'blob',
      }) as any;

      const disposition: string | undefined = res.headers?.['content-disposition'];
      let filename = `reporte-${payload.format || 'csv'}-${Date.now()}.${payload.format || 'csv'}`;
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      const blob = new Blob([res.data], {
        type: res.headers?.['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'ok', data: { filename }, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getServiciosCatalogo(): Promise<ApiWrapper<{ value: string; label: string }[]>> {
    if (USE_MOCKS) {
      return Promise.resolve({
        success: true,
        message: 'mock',
        data: [
          { value: '', label: 'Todos' },
          { value: '1', label: 'Cardiología' },
          { value: '2', label: 'Neurología' },
          { value: '3', label: 'Pediatría' },
          { value: '4', label: 'Medicina General' },
          { value: '5', label: 'Traumatología' },
        ],
        errors: null,
      });
    }
    try {
      const res = await this.client.get('/servicios-catalogo/') as any;
      const d = res?.data;
      const source = d?.data ?? d;
      return { success: true, message: 'ok', data: source as { value: string; label: string }[], errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  async getConsultasRango(filter: ReportFilter): Promise<ApiWrapper> {
    if (USE_MOCKS) {
      return Promise.resolve({
        success: true,
        message: 'mock',
        data: {
          items: Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 30 + i + 1);
            const fecha = d.toISOString().split('T')[0];
            return {
              fecha,
              medica: Math.floor(Math.random() * 10),
              psicologica: Math.floor(Math.random() * 6),
              odontologica: Math.floor(Math.random() * 4),
              social: Math.floor(Math.random() * 3),
              total: 0,
            };
          }).map(item => ({ ...item, total: item.medica + item.psicologica + item.odontologica + item.social })),
          total_consultas: 0,
          total_dias: 30,
        },
        errors: null,
      });
    }
    try {
      const params: any = { fecha_inicio: filter.fecha_inicio, fecha_fin: filter.fecha_fin };
      if (filter.servicioId) params.servicio = filter.servicioId;
      const res = await this.client.get('/consultas-rango/', { params }) as any;
      const d = res?.data;
      const source = d?.data ?? d;
      return { success: true, message: 'ok', data: source, errors: null };
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }

  // Get status of an export job
  async getExportStatus(requestId: string): Promise<ApiWrapper> {
    try {
      const res = await this.client.get(`/export/status/${encodeURIComponent(requestId)}/`) as any;
      const d = res?.data;
      if (d && typeof d === 'object' && 'success' in d) return d as ApiWrapper;
      return { success: true, message: 'ok', data: d, errors: null } as ApiWrapper;
    } catch (e: any) {
      return formatErrorToWrapper(e);
    }
  }
}

const reportService = new ReportService();
export default reportService;
export { ReportService };

