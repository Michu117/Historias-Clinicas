export type PrioridadCasoClinico = 'ALTA' | 'MEDIA' | 'BAJA'
export type EstadoCasoClinico = 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO'

export interface CasoClinico {
  id: string
  historiaClinicaId: string
  fechaApertura: string
  fechaCierre: string | null
  prioridad: PrioridadCasoClinico
  estado: EstadoCasoClinico
  creadoEn?: string
  actualizadoEn?: string
}

export type CasoClinicoModel = CasoClinico
