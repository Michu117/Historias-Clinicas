import React, { useState } from 'react'
import type { AntecedenteClinico } from '../types/antecedenteClinico.types'

type Props = {
  historiaClinicaId: string
  onSubmit?: (payload: Partial<AntecedenteClinico>) => Promise<any>
}
type TipoAntecedenteClinico = NonNullable<AntecedenteClinico['tipo']>

const AntecedenteClinicoForm: React.FC<Props> = ({ historiaClinicaId, onSubmit }) => {
  const [tipo, setTipo] = useState<TipoAntecedenteClinico | undefined>(undefined)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit) return
    await onSubmit({ historiaClinicaId, tipo, descripcion, fecha })
    setTipo(undefined)
    setDescripcion('')
    setFecha('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="tipo">Tipo de antecedente</label>
      <select id="tipo" required value={tipo} onChange={(e) => setTipo(e.target.value ? (e.target.value as TipoAntecedenteClinico): undefined)}>
        <option value="">Seleccione</option>
        <option value="FAMILIAR">Familiar</option>
        <option value="PERSONAL_PATOLOGICO">Personal Patológico</option>
        <option value="PERSONAL_NO_PATOLOGICO">Personal No Patológico</option>
        <option value="GINECO_OBSTETRICO">Gineco-Obstétrico</option>
      </select>

      <label htmlFor="descripcion">Descripción</label>
      <textarea id="descripcion" required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />

      <label htmlFor="fecha">Fecha</label>
      <input id="fecha" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />

      <button type="submit">Registrar</button>
    </form>
  )
}

export default AntecedenteClinicoForm

