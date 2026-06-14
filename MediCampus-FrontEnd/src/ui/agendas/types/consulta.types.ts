/**
 * Tipos para Consulta (Polimórfica)
 * HU-03: Registrar Consulta Médica / HU-04: Registrar Signos Vitales
 */

export enum TipoConsulta {
  CONSULTA_MEDICA = 'CONSULTA_MEDICA',
  SIGNOS_VITALES = 'SIGNOS_VITALES',
}

export interface SignosVitales {
  presion_sistolica: number; // mmHg
  presion_diastolica: number; // mmHg
  frecuencia_cardiaca: number; // bpm
  temperatura: number; // °C
  peso: number; // kg
  talla: number; // cm
  saturacion_oxigeno?: number; // % (0-100)
}

export interface ConsultaBase {
  id?: number;
  cita_id: number;
  profesional_id: number;
  paciente_id: number;
  tipo_consulta: TipoConsulta;
  fecha: Date | string; // ISO 8601
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface ConsultaMedica extends ConsultaBase {
  tipo_consulta: TipoConsulta.CONSULTA_MEDICA;
  diagnostico: string;
  prescripcion?: string;
  notas_clinicas?: string;
}

export interface ConsultaSignosVitales extends ConsultaBase {
  tipo_consulta: TipoConsulta.SIGNOS_VITALES;
  signos_vitales: SignosVitales;
  notas?: string;
}

export type Consulta = ConsultaMedica | ConsultaSignosVitales;

export interface ConsultaCreateDTO {
  cita_id: number;
  tipo_consulta: TipoConsulta;
  diagnostico?: string; // Para CONSULTA_MEDICA
  prescripcion?: string; // Para CONSULTA_MEDICA
  notas_clinicas?: string; // Para CONSULTA_MEDICA
  signos_vitales?: SignosVitales; // Para SIGNOS_VITALES
  notas?: string; // Para SIGNOS_VITALES
}
