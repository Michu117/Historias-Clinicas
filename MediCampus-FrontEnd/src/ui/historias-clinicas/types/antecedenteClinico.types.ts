export type TipoAntecedenteClinico =
  | 'FAMILIAR'
  | 'PERSONAL_PATOLOGICO'
  | 'PERSONAL_NO_PATOLOGICO'
  | 'GINECO_OBSTETRICO'

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

