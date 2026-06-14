export type PrioridadCasoClinico = 'ALTA' | 'MEDIA' | 'BAJA'
export type EstadoCasoClinico = 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO'

export interface CasoClinico {
  id: string
  historiaClinicaId: string
  descripcion: string
  prioridad: PrioridadCasoClinico
  estado: EstadoCasoClinico
  responsable?: string
  fechaApertura?: string
  ultimaActualizacion?: string
  creadoEn?: string
  actualizadoEn?: string
}

export type CasoClinicoModel = CasoClinico

