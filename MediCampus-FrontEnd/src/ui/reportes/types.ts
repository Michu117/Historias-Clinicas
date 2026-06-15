// Tipos e interfaces para el módulo de Reportes
// Fecha: 2026-05-27
// Nota: Solo definiciones de tipos (Tarea 0.1). Implementaciones y lógica irán en otros archivos.

export type ReportType = 'general' | 'servicio' | 'genero' | string;

export type DateRangePreset = 'last30' | 'quarter' | 'year' | 'custom';

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'last30', label: 'Últimos 30 días' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Año actual' },
  { value: 'custom', label: 'Personalizado' },
];

export const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: '1', label: 'Cardiología' },
  { value: '2', label: 'Neurología' },
  { value: '3', label: 'Pediatría' },
  { value: '4', label: 'Medicina General' },
  { value: '5', label: 'Traumatología' },
];

export interface ProfesionalRef {
  id: string;
  nombre?: string;
  apellido?: string;
}

export interface ServicioRef {
  id: string;
  nombre: string;
}

export interface Reporte {
  titulo: string;
  tipo: ReportType; // 'general' | 'servicio' | 'genero'
  fecha_inicio: string; // ISO date YYYY-MM-DD
  fecha_fin: string; // ISO date YYYY-MM-DD
  servicio?: string | null; // servicio id (opcional)
  profesional?: string | null; // profesional id (opcional)
  // metadata opcional para trazabilidad
  creado_por?: string | null;
  creado_en?: string | null; // ISO datetime
}

export interface ReportFilter {
  fecha_inicio: string;
  fecha_fin: string;
  dateRange?: DateRangePreset;
  servicioId?: string | null;
  profesionalId?: string | null;
}

// Wrapper API (contrato) usado por reportesService
export interface ApiWrapper<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors?: Record<string, any> | null;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ReportTableRow {
  id: string;
  fecha: string; // ISO date
  paciente_nombre?: string;
  servicio?: string;
  profesional?: string;
  genero?: string;
  // other dynamic fields
  [key: string]: any;
}

