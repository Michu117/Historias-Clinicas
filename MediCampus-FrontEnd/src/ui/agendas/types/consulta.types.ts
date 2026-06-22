export interface SignosVitales {
  peso_kg: number;
  temperatura: number;
  presion_arterial: string;
  frecuencia_cardiaca: number;
}

export interface ConsultaMedica {
  id?: number;
  cita: number;
  historia_clinica_id: number;
  anamnesis: string;
  tratamiento: string;
  diagnostico: string;
  signos_vitales?: SignosVitales;
  observaciones?: string;
  servicios?: number[];
  fecha_creacion?: string;
}

export interface ConsultaOdontologica {
  id?: number;
  cita: number;
  historia_clinica_id: number;
  odontograma: string;
  procedimientos: string;
  observaciones?: string;
  servicios?: number[];
  fecha_creacion?: string;
}

export interface ConsultaPsicologica {
  id?: number;
  cita: number;
  historia_clinica_id: number;
  diagnostico: string;
  notas_evolucion?: string;
  estado_humor?: string;
  nivel_ansiedad?: number;
  nivel_autoestima?: number;
  observaciones?: string;
  servicios?: number[];
  fecha_creacion?: string;
}

export interface ConsultaSocial {
  id?: number;
  cita: number;
  historia_clinica_id: number;
  nivel_socioeconomico?: string;
  descripcion_vivienda?: string;
  observaciones?: string;
  servicios?: number[];
  fecha_creacion?: string;
}

export type Consulta = ConsultaMedica | ConsultaOdontologica | ConsultaPsicologica | ConsultaSocial;
