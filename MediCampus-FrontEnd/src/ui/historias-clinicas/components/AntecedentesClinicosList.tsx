import React, { useState } from 'react'
import { Button } from '../../../ui/components/Button'
import { Modal } from '../../../ui/components/Modal'
import type { AntecedenteClinico } from '../types/antecedenteClinico.types'
import AntecedenteClinicoForm from './AntecedenteClinicoForm'

const TIPO_LABELS: Record<string, string> = {
  HEREDOFAMILIARES: 'Heredofamiliares',
  PERSONALES_NO_PATOLOGICOS: 'Personales no patológicos',
  PERSONALES_PATOLOGICOS: 'Personales patológicos',
  GINECO_OBSTETRICOS: 'Gineco obstétricos',
}

interface Props {
  items: AntecedenteClinico[]
  onCreate: (payload: Partial<AntecedenteClinico>) => Promise<void>
  onUpdate: (id: string, payload: Partial<AntecedenteClinico>) => Promise<void>
  readOnly?: boolean
}

const AntecedentesClinicosList: React.FC<Props> = ({ items, onCreate, onUpdate, readOnly = false }) => {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<AntecedenteClinico | null>(null)

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Button type="button" variant="primary" size="sm" onClick={() => setCreating(true)}>
          Agregar antecedente
        </Button>
      )}

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No hay antecedentes registrados.</p>
      ) : (
        <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold" style={{ backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Fecha</th>
                {!readOnly && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--surface-container-high)' }}>
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--on-surface)' }}>
                    {TIPO_LABELS[a.tipo] ?? a.tipo}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--on-surface-variant)' }}>{a.descripcion}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--on-surface-variant)' }}>{a.fecha}</td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="tertiary" size="sm" onClick={() => setEditing(a)}>
                          Editar
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Agregar antecedente">
        <AntecedenteClinicoForm
          onSubmit={async (payload) => {
            await onCreate(payload)
            setCreating(false)
          }}
          onCancel={() => setCreating(false)}
        />
      </Modal>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar antecedente">
        {editing && (
          <AntecedenteClinicoForm
            initial={editing}
            onSubmit={async (payload) => {
              await onUpdate(editing.id, payload)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}

export default AntecedentesClinicosList
