export type TipoAntecedenteClinico =
  | 'HEREDOFAMILIARES'
  | 'PERSONALES_NO_PATOLOGICOS'
  | 'PERSONALES_PATOLOGICOS'
  | 'GINECO_OBSTETRICOS'

export interface AntecedenteClinico {
  id: string
  historiaClinicaId: string
  tipo: TipoAntecedenteClinico
  descripcion: string
  fecha: string
  creadoEn?: string
  actualizadoEn?: string
}

export type AntecedenteClinicoModel = AntecedenteClinico
