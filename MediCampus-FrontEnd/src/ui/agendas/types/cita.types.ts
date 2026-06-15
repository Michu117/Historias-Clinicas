/**
 * Tipos para Cita y Estados de Cita
 * Entidad central del módulo de Agendas
 */

export enum EstadoCita {
  AGENDADA = 'AGENDADA',
  ATENDIDA = 'ATENDIDA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export interface Cita {
  id: number;
  paciente_id: number;
  paciente_nombre?: string;
  profesional_id: number;
  servicio_id: number;
  servicios_ids?: number[]; // M2M para validar RN-003
  fecha: Date | string; // ISO 8601 en backend
  hora: string; // HH:mm
  duracion_minutos: number; // Siempre 30 minutos (RN-002)
  margen_minutos: number; // Siempre 30 minutos (RN-002)
  estado: EstadoCita;
  motivo?: string;
  notas?: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CitaCreateDTO {
  paciente_id?: number; // Puede deducirse del JWT
  profesional_id: number;
  servicio_id: number;
  fecha: string; // ISO 8601
  hora: string; // HH:mm
  motivo?: string;
}

export interface CitaUpdateDTO {
  estado?: EstadoCita;
  notas?: string;
}

export interface CitaFilters {
  fecha_desde?: string; // ISO 8601
  fecha_hasta?: string; // ISO 8601
  estado?: EstadoCita;
  profesional_id?: number;
  paciente_id?: number;
  servicio_id?: number;
}
