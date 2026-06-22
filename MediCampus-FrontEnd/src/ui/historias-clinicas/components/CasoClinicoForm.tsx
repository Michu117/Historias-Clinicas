import React, { useState } from 'react'
import { Button } from '../../../ui/components/Button'
import { normalizarFecha } from '../utils/dateFormatter'
import type { CasoClinico, EstadoCasoClinico, PrioridadCasoClinico } from '../types/casoClinico.types'

interface Props {
  initial?: CasoClinico
  onSubmit: (payload: Partial<CasoClinico>) => Promise<void>
  onCancel?: () => void
}

const ESTADO_OPTIONS: { value: EstadoCasoClinico; label: string }[] = [
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'EN_SEGUIMIENTO', label: 'En seguimiento' },
  { value: 'CERRADO', label: 'Cerrado' },
]

const PRIORIDAD_OPTIONS: { value: PrioridadCasoClinico; label: string }[] = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
]

const CasoClinicoForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [fechaApertura, setFechaApertura] = useState(initial?.fechaApertura ? normalizarFecha(initial.fechaApertura) : '')
  const [fechaCierre, setFechaCierre] = useState(initial?.fechaCierre ? normalizarFecha(initial.fechaCierre) : '')
  const [estado, setEstado] = useState<EstadoCasoClinico>(initial?.estado ?? 'ABIERTO')
  const [prioridad, setPrioridad] = useState<PrioridadCasoClinico>(initial?.prioridad ?? 'MEDIA')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fechaApertura) return
    setSaving(true)
    await onSubmit({
      fechaApertura: normalizarFecha(fechaApertura),
      fechaCierre: fechaCierre ? normalizarFecha(fechaCierre) : null,
      estado,
      prioridad,
    })
    setSaving(false)
    if (!initial) {
      setFechaApertura('')
      setFechaCierre('')
      setEstado('ABIERTO')
      setPrioridad('MEDIA')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            Fecha de apertura
          </label>
          <input
            type="date"
            required
            value={fechaApertura}
            onChange={(e) => setFechaApertura(e.target.value)}
            className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
            style={{ borderColor: 'var(--outline-variant)' }}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            Fecha de cierre <span style={{ color: 'var(--card-text-muted)' }}>(opcional)</span>
          </label>
          <input
            type="date"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
            className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
            style={{ borderColor: 'var(--outline-variant)' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            Estado del caso
          </label>
          <select
            required
            value={estado}
            onChange={(e) => {
              const val = e.target.value as EstadoCasoClinico
              setEstado(val)
              if (val !== 'CERRADO') setFechaCierre('')
            }}
            className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
            style={{ borderColor: 'var(--outline-variant)' }}
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
            Prioridad
          </label>
          <select
            required
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadCasoClinico)}
            className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
            style={{ borderColor: 'var(--outline-variant)' }}
          >
            {PRIORIDAD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={saving || !fechaApertura}>
          {saving ? 'Guardando...' : initial ? 'Actualizar' : 'Agregar caso clínico'}
        </Button>
      </div>
    </form>
  )
}

export default CasoClinicoForm
