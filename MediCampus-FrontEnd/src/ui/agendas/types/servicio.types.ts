/**
 * Tipos para Servicio (Especialidad)
 */

import { Profesional } from './professional.types';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  es_activo: boolean; // RN-004: Strict boolean check (=== true)
  profesionales?: number[] | Profesional[]; // IDs o datos breves de profesionales que ofrecen este servicio
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface ServicioFilters {
  es_activo?: boolean;
}
