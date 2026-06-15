export type TipoDocumentoClinico =
  | 'RESULTADO_CONSULTA'
  | 'FORMULARIO'
  | 'CONSENTIMIENTO'
  | 'CERTIFICADO'

export interface DocumentoClinico {
  id: string
  historiaClinicaId: string
  fecha: string
  encabezado: string
  cuerpo: string
  tipo: TipoDocumentoClinico
  nombreArchivo?: string
  urlArchivo?: string
  creadoEn?: string
  actualizadoEn?: string
}

export type DocumentoClinicoModel = DocumentoClinico

export const cloneDocumentoClinico = (
  documento: DocumentoClinicoModel,
): DocumentoClinicoModel => documento


