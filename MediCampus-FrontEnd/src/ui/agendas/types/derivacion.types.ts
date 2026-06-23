/**
 * Tipos para Derivación (Referral)
 * HU-05: Gestionar Derivaciones
 */

export enum EstadoDerivacion {
  PENDIENTE = 'PENDIENTE',
  ACEPTADA = 'ACEPTADA',
  RECHAZADA = 'RECHAZADA',
  COMPLETADA = 'COMPLETADA',
}

export interface Derivacion {
  id: number;
  cita_origen_id: number; // Cita que genera la derivación
  profesional_origen_id: number; // Profesional que derivó (remitente)
  usuario_id?: number; // Usuario que realizó la acción (trazabilidad)
  servicio_destino_id: number; // Servicio al que se deriva
  profesional_destino_id?: number; // Profesional específico (opcional)
  motivo: string;
  estado: EstadoDerivacion;
  fecha_creacion: Date | string; // ISO 8601
  fecha_respuesta?: Date | string; // Cuando se acepta/rechaza
  notas_respuesta?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface DerivacionCreateDTO {
  cita_origen_id: number;
  servicio_destino_id: number;
  profesional_destino_id?: number;
  usuario_id?: number;
  motivo: string;
}

export interface DerivacionResponseDTO {
  id: number;
  estado: EstadoDerivacion;
  notas_respuesta?: string;
}

export interface DerivacionFilters {
  estado?: EstadoDerivacion;
  servicio_destino_id?: number;
  profesional_destino_id?: number;
}
