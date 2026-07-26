export type TipoDocumentoClinico =
  | 'RESULTADO'
  | 'FORMULARIOS'
  | 'CONSENTIMIENTO'
  | 'CERTIFICADO'

export interface DocumentoClinico {
  id: string
  historiaClinicaId: string
  fecha: string
  encabezado: string
  cuerpo: string
  tipo: TipoDocumentoClinico
  creadoEn?: string
  actualizadoEn?: string
  casoClinicoId?: string
}

export type DocumentoClinicoModel = DocumentoClinico

export const cloneDocumentoClinico = (
  documento: DocumentoClinicoModel,
): DocumentoClinicoModel => documento
