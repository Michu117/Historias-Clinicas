import type { EstadoHistoriaClinica } from '../types'
import type { EstadoCasoClinico } from '../types'

export type EstadoNormalizado = 'activa' | 'cerrada' | 'abierto' | 'en_seguimiento'

/**
 * Normaliza el estado de una historia clínica para presentación consistente
 */
export const normalizeHistoriaEstado = (estado: EstadoHistoriaClinica): string => {
  const estadoMap: Record<EstadoHistoriaClinica, string> = {
    ACTIVA: 'Activa',
    CERRADA: 'Cerrada',
  }
  return estadoMap[estado] || estado
}

/**
 * Normaliza el estado de un caso clínico para presentación consistente
 */
export const normalizeCasoEstado = (estado: EstadoCasoClinico): string => {
  const estadoMap: Record<EstadoCasoClinico, string> = {
    ABIERTO: 'Abierto',
    EN_SEGUIMIENTO: 'En seguimiento',
    CERRADO: 'Cerrado',
  }
  return estadoMap[estado] || estado
}

/**
 * Normaliza la prioridad de un caso clínico
 */
export const normalizePrioridad = (prioridad: 'ALTA' | 'MEDIA' | 'BAJA'): string => {
  const prioridadMap = {
    ALTA: 'Alta',
    MEDIA: 'Media',
    BAJA: 'Baja',
  }
  return prioridadMap[prioridad] || prioridad
}
