export interface ConsultaClinico {
  id: string
  historiaClinicaId?: string
  tipo: string
  fecha: string
  motivo: string
  estado: string
  observaciones: string
  anamnesis?: string | null
  diagnostico?: string | null
  tratamiento?: string | null
  signosVitales?: Record<string, unknown> | null
  servicios?: string[]
}
