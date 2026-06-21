import React, { useEffect, useState } from 'react'
import { Button } from '../../../ui/components/Button'
import { Modal } from '../../../ui/components/Modal'
import { historiasClinicasService } from '../services/historiasClinicasService'
import DocumentoClinicoForm from './DocumentoClinicoForm'
import { generarDocumentoClinicoPDF } from '../utils/generarDocumentoClinicoPDF'
import { obtenerCasoAsociadoDocumento, guardarCasoAsociadoDocumento, esCasoAtendido } from '../utils/documentoResultadoStorage'
import type { DocumentoClinico, TipoDocumentoClinico } from '../types/documentoClinico.types'
import type { HistoriaClinica } from '../types/historiaClinica.types'
import type { ConsultaClinico } from '../types/consultaClinico.types'

const TIPO_DOC_LABELS: Record<string, string> = {
  RESULTADO: 'Resultado',
  FORMULARIOS: 'Formularios',
  CONSENTIMIENTO: 'Consentimiento',
  CERTIFICADO: 'Certificado',
}

const TIPO_FILTER_OPTIONS: { value: TipoDocumentoClinico | ''; label: string }[] = [
  { value: '', label: 'Todos' },
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

interface DocumentosClinicosListProps {
  historiaClinicaId: string
  readOnly?: boolean
  showFilters?: boolean
  historia?: HistoriaClinica
  medicoNombre?: string
}

const DocumentosClinicosList: React.FC<DocumentosClinicosListProps> = ({
  historiaClinicaId,
  readOnly = false,
  showFilters = true,
  historia,
  medicoNombre,
}) => {
  const [documentos, setDocumentos] = useState<DocumentoClinico[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState<TipoDocumentoClinico | ''>('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // ── Estado para picker de caso en RESULTADO ──
  const [showCasoPicker, setShowCasoPicker] = useState(false)
  const [docParaDescargar, setDocParaDescargar] = useState<DocumentoClinico | null>(null)
  const [casosDisponibles, setCasosDisponibles] = useState<ConsultaClinico[]>([])
  const [casoSeleccionado, setCasoSeleccionado] = useState('')
  const [loadingCasos, setLoadingCasos] = useState(false)

  const cargarDocumentos = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await historiasClinicasService.listarDocumentosPorHistoria(historiaClinicaId)
      setDocumentos(data)
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar documentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDocumentos()
  }, [historiaClinicaId])

  const filtrados = documentos.filter((d) => {
    if (filtroTipo && d.tipo !== filtroTipo) return false
    if (fechaDesde && d.fecha < fechaDesde) return false
    if (fechaHasta && d.fecha > fechaHasta) return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      if (!d.encabezado.toLowerCase().includes(q) && !d.cuerpo.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleDescargar = (doc: DocumentoClinico) => {
    if (!historia) return
    if (doc.tipo === 'RESULTADO') {
      const casoAsociado = obtenerCasoAsociadoDocumento(historiaClinicaId, doc.id)
      if (casoAsociado && esCasoAtendido(casoAsociado.estado)) {
        generarDocumentoClinicoPDF({
          documento: doc,
          historia,
          medicoNombre: medicoNombre ?? 'Médico responsable',
          caso: casoAsociado,
        })
        return
      }
      if (casoAsociado && !esCasoAtendido(casoAsociado.estado)) {
        setError('Este resultado no puede descargarse porque el caso clínico asociado no está atendido.')
        return
      }
      setDocParaDescargar(doc)
      setCasoSeleccionado('')
      setLoadingCasos(true)
      setShowCasoPicker(true)
      historiasClinicasService.listarCasosClinicosPorHistoria(historiaClinicaId)
        .then((data) => setCasosDisponibles(data))
        .catch(() => setCasosDisponibles([]))
        .finally(() => setLoadingCasos(false))
    } else {
      generarDocumentoClinicoPDF({
        documento: doc,
        historia,
        medicoNombre: medicoNombre ?? 'Médico responsable',
      })
    }
  }

  const handleConfirmarDescarga = () => {
    if (!historia || !docParaDescargar) return
    const caso = casosDisponibles.find((c) => c.id === casoSeleccionado) ?? null
    if (caso && esCasoAtendido(caso.estado)) {
      guardarCasoAsociadoDocumento(historiaClinicaId, docParaDescargar.id, caso)
    }
    generarDocumentoClinicoPDF({
      documento: docParaDescargar,
      historia,
      medicoNombre: medicoNombre ?? 'Médico responsable',
      caso,
    })
    setShowCasoPicker(false)
    setDocParaDescargar(null)
    setCasoSeleccionado('')
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Button type="button" variant="primary" size="sm" onClick={() => setShowModal(true)}>
          Adjuntar documento
        </Button>
      )}

      {showFilters && (
        <div className="grid grid-cols-2 gap-3 rounded-global border border-slate-200 bg-white p-4 md:grid-cols-4">
          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-600">Tipo</label>
            <select value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoDocumentoClinico | '')}
              className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary">
              {TIPO_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-600">Fecha desde</label>
            <input type="date" value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-600">Fecha hasta</label>
            <input type="date" value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-medium text-slate-600">Buscar</label>
            <input type="text" value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Encabezado o cuerpo..."
              className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary" />
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando documentos...</p>}
      {error && <p className="text-sm font-medium text-rose-600">{error}</p>}

      {!loading && filtrados.length === 0 && (
        <p className="text-sm text-slate-500">No se encontraron documentos clínicos.</p>
      )}

      {!loading && filtrados.length > 0 && (
        <div className="overflow-hidden rounded-global border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Encabezado</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{d.fecha}</td>
                  <td className="px-4 py-3 text-slate-600">{d.encabezado}</td>
                  <td className="px-4 py-3 text-slate-600">{TIPO_DOC_LABELS[d.tipo] ?? d.tipo}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="tertiary" size="sm" onClick={() => handleDescargar(d)}>
                        Descargar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Adjuntar documento">
        <DocumentoClinicoForm
          historiaClinicaId={historiaClinicaId}
          onSuccess={() => {
            setShowModal(false)
            cargarDocumentos()
          }}
        />
      </Modal>

      <Modal open={showCasoPicker} onClose={() => { setShowCasoPicker(false); setDocParaDescargar(null) }} title="Seleccionar caso clínico">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Seleccione el caso clínico asociado a este resultado para incluirlo en el PDF.
          </p>
          {(() => {
            const casosAtendidos = casosDisponibles.filter((c) => esCasoAtendido(c.estado))
            if (loadingCasos) return <p className="text-sm text-slate-500">Cargando casos clínicos...</p>
            if (casosAtendidos.length === 0) return <p className="text-sm text-slate-500">No existen casos clínicos atendidos para generar un resultado.</p>
            return (
              <select value={casoSeleccionado}
                onChange={(e) => setCasoSeleccionado(e.target.value)}
                className="block w-full rounded-global border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-hc-primary focus:outline-none focus:ring-1 focus:ring-hc-primary">
                <option value="">Seleccione un caso clínico...</option>
                {casosAtendidos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fecha} | {c.motivo} | {c.tipo} | {ESTADO_LABELS[c.estado] ?? c.estado}
                  </option>
                ))}
              </select>
            )
          })()}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setShowCasoPicker(false); setDocParaDescargar(null) }}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmarDescarga} disabled={loadingCasos}>
              Descargar PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DocumentosClinicosList
