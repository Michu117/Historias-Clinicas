import React, { useState } from 'react'
import { Button } from '../../../ui/components/Button'
import { Modal } from '../../../ui/components/Modal'
import type { CasoClinico } from '../types/casoClinico.types'
import CasoClinicoForm from './CasoClinicoForm'

const ESTADO_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_SEGUIMIENTO: 'En seguimiento',
  CERRADO: 'Cerrado',
}

const PRIORIDAD_LABELS: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
}

interface Props {
  items: CasoClinico[]
  onCreate: (payload: Partial<CasoClinico>) => Promise<void>
  onUpdate: (id: string, payload: Partial<CasoClinico>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  readOnly?: boolean
}

const CasosClinicosList: React.FC<Props> = ({ items, onCreate, onUpdate, onDelete, readOnly = false }) => {
  const [editing, setEditing] = useState<CasoClinico | null>(null)
  const [deleting, setDeleting] = useState<CasoClinico | null>(null)

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>Nuevo caso clínico</h3>
          <CasoClinicoForm onSubmit={onCreate} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No hay casos clínicos registrados.</p>
      ) : (
        <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--card-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold" style={{ backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                <th className="px-4 py-3">Fecha apertura</th>
                <th className="px-4 py-3">Fecha cierre</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Prioridad</th>
                {!readOnly && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--surface-container-high)' }}>
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--on-surface)' }}>{c.fechaApertura}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--on-surface-variant)' }}>{c.fechaCierre || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--on-surface-variant)' }}>{ESTADO_LABELS[c.estado] ?? c.estado}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--on-surface-variant)' }}>{PRIORIDAD_LABELS[c.prioridad] ?? c.prioridad}</td>
                  {!readOnly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="tertiary" size="sm" onClick={() => setEditing(c)}>
                          Editar
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={() => setDeleting(c)}>
                          Eliminar
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

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="Editar caso clínico">
        {editing && (
          <CasoClinicoForm
            initial={editing}
            onSubmit={async (payload) => {
              await onUpdate(editing.id, payload)
              setEditing(null)
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Confirmar eliminación">
        {deleting && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
              ¿Está seguro de eliminar este caso clínico? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={async () => {
                await onDelete(deleting.id)
                setDeleting(null)
              }}>
                Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CasosClinicosList
