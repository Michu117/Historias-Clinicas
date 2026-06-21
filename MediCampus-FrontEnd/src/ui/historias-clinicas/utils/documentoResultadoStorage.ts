import type { ConsultaClinico } from '../types/consultaClinico.types'

const getDocumentoResultadoCasoKey = (
  historiaClinicaId: string | number,
  documentoId: string | number
) => `medicampus_documento_resultado_caso_${historiaClinicaId}_${documentoId}`

export const guardarCasoAsociadoDocumento = (
  historiaClinicaId: string | number,
  documentoId: string | number,
  casoClinico: ConsultaClinico
): void => {
  localStorage.setItem(
    getDocumentoResultadoCasoKey(historiaClinicaId, documentoId),
    JSON.stringify(casoClinico)
  )
}

export const obtenerCasoAsociadoDocumento = (
  historiaClinicaId: string | number,
  documentoId: string | number
): ConsultaClinico | null => {
  const raw = localStorage.getItem(
    getDocumentoResultadoCasoKey(historiaClinicaId, documentoId)
  )
  if (!raw) return null
  try {
    return JSON.parse(raw) as ConsultaClinico
  } catch {
    return null
  }
}

export const normalizarEstadoCaso = (estado?: string): string =>
  String(estado ?? '')
    .toUpperCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

export const esCasoAtendido = (estado?: string): boolean =>
  normalizarEstadoCaso(estado) === 'ATENDIDA'
