import React, { useState } from 'react'
import { Button } from '../../../ui/components/Button'
import type { AntecedenteClinico, TipoAntecedenteClinico } from '../types/antecedenteClinico.types'

interface Props {
  initial?: AntecedenteClinico
  onSubmit: (payload: Partial<AntecedenteClinico>) => Promise<void>
  onCancel?: () => void
}

const TIPO_OPTIONS: { value: TipoAntecedenteClinico | ''; label: string }[] = [
  { value: '', label: 'Seleccione...' },
  { value: 'HEREDOFAMILIARES', label: 'Heredofamiliares' },
  { value: 'PERSONALES_NO_PATOLOGICOS', label: 'Personales no patológicos' },
  { value: 'PERSONALES_PATOLOGICOS', label: 'Personales patológicos' },
  { value: 'GINECO_OBSTETRICOS', label: 'Gineco obstétricos' },
]

const AntecedenteClinicoForm: React.FC<Props> = ({ initial, onSubmit, onCancel }) => {
  const [tipo, setTipo] = useState<TipoAntecedenteClinico | ''>(initial?.tipo ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [fecha, setFecha] = useState(initial?.fecha ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipo || !descripcion.trim() || !fecha) return
    setSaving(true)
    await onSubmit({ tipo, descripcion, fecha })
    setSaving(false)
    if (!initial) {
      setTipo('')
      setDescripcion('')
      setFecha('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Tipo de antecedente
        </label>
        <select
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoAntecedenteClinico)}
          className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
        >
          {TIPO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          required
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Fecha
        </label>
        <input
          type="date"
          required
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={saving || !tipo || !descripcion.trim() || !fecha}>
          {saving ? 'Guardando...' : initial ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </form>
  )
}

export default AntecedenteClinicoForm
