import React, { useState } from 'react'
import type { CasoClinico } from '../types/casoClinico.types'

type PrioridadCaso = 'ALTA' | 'MEDIA' | 'BAJA'
type EstadoCaso = 'ABIERTO' | 'EN_SEGUIMIENTO' | 'CERRADO'

interface CasoClinicoFormProps {
  historiaClinicaId: string
  casos?: CasoClinico[]
  onSubmit?: (payload: Partial<CasoClinico>) => Promise<any>
}

const CasoClinicoForm: React.FC<CasoClinicoFormProps> = ({
  historiaClinicaId,
  casos = [],
  onSubmit,
}) => {
  const [descripcion, setDescripcion] = useState('')
  const [prioridad, setPrioridad] = useState<PrioridadCaso | ''>('')
  const [estado, setEstado] = useState<EstadoCaso | ''>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!onSubmit) return

    await onSubmit({
      historiaClinicaId,
      descripcion,
      prioridad: prioridad || 'MEDIA',
      estado: estado || 'ABIERTO',
    })

    setDescripcion('')
    setPrioridad('')
    setEstado('')
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            required
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="priority">Prioridad</label>
          <select
            id="priority"
            required
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadCaso | '')}
          >
            <option value="">Seleccione</option>
            <option value="ALTA">ALTA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="BAJA">BAJA</option>
          </select>
        </div>

        <div>
          <label htmlFor="state">Estado</label>
          <select
            id="state"
            required
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoCaso | '')}
          >
            <option value="">Seleccione</option>
            <option value="ABIERTO">ABIERTO</option>
            <option value="EN_SEGUIMIENTO">EN_SEGUIMIENTO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
        </div>

        <button type="submit">Crear Caso</button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Casos registrados</h3>

        {casos.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay casos clínicos registrados.
          </p>
        ) : (
          casos.map((caso) => (
            <div
              key={caso.id}
              className="rounded-global border border-slate-200 p-3"
            >
              <p className="text-sm font-medium">
                {caso.descripcion || 'Caso clínico sin descripción'}
              </p>

              <p className="text-xs text-slate-500">
                Estado: {caso.estado || 'Sin estado'} | Prioridad:{' '}
                {caso.prioridad || 'Sin prioridad'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CasoClinicoForm