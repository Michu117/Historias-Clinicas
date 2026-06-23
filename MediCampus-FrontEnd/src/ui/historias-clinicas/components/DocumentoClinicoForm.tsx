import React, { useEffect, useState } from 'react'
import { Button } from '../../../ui/components/Button'
import { normalizarFecha } from '../utils/dateFormatter'
import { guardarCasoAsociadoDocumento, esCasoAtendido } from '../utils/documentoResultadoStorage'
import { historiasClinicasService } from '../services/historiasClinicasService'
import type { TipoDocumentoClinico } from '../types/documentoClinico.types'
import type { ConsultaClinico } from '../types/consultaClinico.types'

const TIPO_DOCUMENTO_OPTIONS: { value: TipoDocumentoClinico; label: string }[] = [
  { value: 'RESULTADO', label: 'Resultado' },
  { value: 'FORMULARIOS', label: 'Formularios' },
  { value: 'CONSENTIMIENTO', label: 'Consentimiento' },
  { value: 'CERTIFICADO', label: 'Certificado' },
]

const ESTADO_LABELS: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_SEGUIMIENTO: 'En seguimiento',
  CERRADO: 'Cerrado',
  ATENDIDA: 'Atendida',
  PENDIENTE: 'Pendiente',
}

const hoy = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

type Props = {
  historiaClinicaId: string
  onSuccess?: () => void
}

const DocumentoClinicoForm: React.FC<Props> = ({ historiaClinicaId, onSuccess }) => {
  const [fecha] = useState(hoy())
  const [encabezado, setEncabezado] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [tipo, setTipo] = useState<TipoDocumentoClinico | ''>('')
  const [casos, setCasos] = useState<ConsultaClinico[]>([])
  const [casoId, setCasoId] = useState('')
  const [loadingCasos, setLoadingCasos] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const casosAtendidos = casos.filter((c) => esCasoAtendido(c.estado))

  useEffect(() => {
    if (tipo === 'RESULTADO') {
      setLoadingCasos(true)
      historiasClinicasService.listarCasosClinicosPorHistoria(historiaClinicaId)
        .then((data) => setCasos(data))
        .catch(() => setCasos([]))
        .finally(() => setLoadingCasos(false))
    } else {
      setCasos([])
      setCasoId('')
    }
  }, [tipo, historiaClinicaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!encabezado.trim() || !cuerpo.trim() || !tipo) {
      setError('Todos los campos son obligatorios.')
      return
    }
    if (tipo === 'RESULTADO') {
      if (!casoId) {
        setError('Debe seleccionar un caso clínico atendido para generar un resultado.')
        return
      }
      const casoSeleccionado = casos.find((c) => c.id === casoId)
      if (!casoSeleccionado || !esCasoAtendido(casoSeleccionado.estado)) {
        setError('Solo se puede generar un resultado de un caso clínico atendido.')
        return
      }
    }
    setSubmitting(true)
    setError('')
    try {
      const documentoCreado = await historiasClinicasService.crearDocumentoClinico({
        historiaClinicaId,
        fecha: normalizarFecha(fecha),
        encabezado: encabezado.trim(),
        cuerpo: cuerpo.trim(),
        tipo,
      })
      if (
        documentoCreado?.id &&
        tipo === 'RESULTADO' &&
        casoId
      ) {
        const casoSeleccionado = casos.find((c) => c.id === casoId)
        if (casoSeleccionado && esCasoAtendido(casoSeleccionado.estado)) {
          guardarCasoAsociadoDocumento(historiaClinicaId, documentoCreado.id, casoSeleccionado)
        }
      }
      setEncabezado('')
      setCuerpo('')
      setTipo('')
      setCasoId('')
      onSuccess?.()
    } catch (err: any) {
      setError(err?.message ?? 'Error al crear el documento.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Fecha del documento</label>
        <input type="date" value={fecha} readOnly tabIndex={-1}
          className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm"
          style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--surface-container-low)', color: 'var(--card-text-muted)' }} />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Tipo de documento</label>
        <select value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoDocumentoClinico)}
          className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
          style={{ borderColor: 'var(--outline-variant)' }}>
          <option value="">Seleccione...</option>
          {TIPO_DOCUMENTO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {tipo === 'RESULTADO' && (
        <div className="grid gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Casos clínicos</label>
          {loadingCasos ? (
            <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>Cargando casos clínicos...</p>
          ) : casosAtendidos.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--card-text-muted)' }}>No existen casos clínicos atendidos para generar un resultado.</p>
          ) : (
            <select value={casoId}
              onChange={(e) => setCasoId(e.target.value)}
              className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
              style={{ borderColor: 'var(--outline-variant)' }}>
              <option value="">Seleccione un caso clínico...</option>
              {casosAtendidos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fecha} | {c.motivo} | {c.tipo} | {ESTADO_LABELS[c.estado] ?? c.estado}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Encabezado</label>
        <input type="text" value={encabezado}
          onChange={(e) => setEncabezado(e.target.value)}
          placeholder="Título o encabezado del documento"
          className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
          style={{ borderColor: 'var(--outline-variant)' }} />
      </div>

      <div className="grid gap-1">
        <label className="text-xs font-medium" style={{ color: 'var(--on-surface-variant)' }}>Cuerpo</label>
        <textarea value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)} rows={4}
          placeholder="Contenido del documento"
          className="block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary"
          style={{ borderColor: 'var(--outline-variant)' }} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Adjuntar'}
        </Button>
      </div>
    </form>
  )
}

export default DocumentoClinicoForm
