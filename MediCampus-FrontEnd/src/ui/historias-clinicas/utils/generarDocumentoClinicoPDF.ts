import { jsPDF } from 'jspdf'
import type { DocumentoClinico } from '../types/documentoClinico.types'
import type { HistoriaClinica } from '../types/historiaClinica.types'
import type { ConsultaClinico } from '../types/consultaClinico.types'

const TIPO_LABELS: Record<string, string> = {
  RESULTADO: 'Resultado de Consulta',
  FORMULARIOS: 'Formulario',
  CONSENTIMIENTO: 'Consentimiento',
  CERTIFICADO: 'Certificado',
}

interface GenerarPDFParams {
  documento: DocumentoClinico
  historia: HistoriaClinica
  medicoNombre: string
  caso?: ConsultaClinico | null
}

export function generarDocumentoClinicoPDF({ documento, historia, medicoNombre, caso }: GenerarPDFParams) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.getWidth()
  const m = 20
  let y = m

  const titulo = (text: string, size = 14) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'bold')
    doc.text(text, pw / 2, y, { align: 'center' })
    y += size * 0.6 + 4
  }

  const subtitulo = (text: string) => {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(text, m, y)
    y += 7
  }

  const linea = (text: string, size = 10) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    doc.text(text, m, y)
    y += size * 0.45 + 1
  }

  const cuerpo = (text: string, size = 10) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, pw - m * 2)
    doc.text(lines, m, y)
    y += lines.length * size * 0.45 + 3
  }

  const paciente = historia.usuario
  const tipoRaw = documento.tipo
  const tipoLabel = TIPO_LABELS[tipoRaw] ?? tipoRaw

  // ── Header ──
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDICAMPUS', pw / 2, y, { align: 'center' })
  y += 10

  const slug = (s: string) => s.toLowerCase().replace(/[^a-záéíóúñ\s]/g, '').replace(/\s+/g, '-')
  const pSlug = slug(paciente.nombre)
  const fSlug = (documento.fecha || '').replace(/-/g, '-')
  let filename = ''

  if (tipoRaw === 'RESULTADO') {
    titulo('RESULTADO DE CONSULTA')
    filename = `resultado-consulta-${pSlug}-${fSlug}.pdf`
  } else if (tipoRaw === 'CERTIFICADO') {
    titulo('CERTIFICADO MÉDICO')
    filename = `certificado-${pSlug}-${fSlug}.pdf`
  } else if (tipoRaw === 'CONSENTIMIENTO') {
    titulo('CONSENTIMIENTO INFORMADO')
    filename = `consentimiento-${pSlug}-${fSlug}.pdf`
  } else {
    titulo('FORMULARIO CLÍNICO')
    filename = `formulario-${pSlug}-${fSlug}.pdf`
  }

  // ── Datos paciente ──
  subtitulo('DATOS DEL PACIENTE')
  linea(`Paciente: ${paciente.nombre}`)
  linea(`Identificación: ${paciente.identificacion}`)
  linea(`Fecha de emisión: ${documento.fecha}`)
  y += 4

  // ── Caso asociado (solo RESULTADO) ──
  if (tipoRaw === 'RESULTADO') {
    if (caso) {
      subtitulo('DATOS DEL CASO CLÍNICO ASOCIADO')
      linea(`Fecha: ${caso.fecha}`)
      linea(`Motivo: ${caso.motivo}`)
      linea(`Tipo: ${caso.tipo}`)
      linea(`Estado: ${caso.estado}`)
      if (caso.observaciones) linea(`Observaciones: ${caso.observaciones}`)
    } else {
      subtitulo('DATOS DEL CASO CLÍNICO ASOCIADO')
      linea('No se seleccionó caso clínico asociado.')
    }
    y += 4
  }

  // ── Texto base por tipo ──
  if (tipoRaw === 'CERTIFICADO') {
    linea(`Se certifica que el/la paciente ${paciente.nombre}, con identificación ${paciente.identificacion}, fue atendido/a en MediCampus.`, 10)
    y += 4
  } else if (tipoRaw === 'CONSENTIMIENTO') {
    linea('El/la paciente declara haber sido informado/a sobre la atención, procedimiento o indicación descrita en este documento.', 10)
    y += 4
  }

  // ── Encabezado ──
  subtitulo('ENCABEZADO')
  cuerpo(documento.encabezado)
  y += 2

  // ── Cuerpo ──
  subtitulo('CUERPO')
  cuerpo(documento.cuerpo)
  y += 4

  // ── Medico ──
  subtitulo('DATOS DEL MÉDICO')
  linea(`Médico responsable: ${medicoNombre}`)
  y += 6

  // ── Firmas ──
  const bottom = doc.internal.pageSize.getHeight() - 30
  y = Math.max(y, bottom)

  if (tipoRaw === 'CONSENTIMIENTO') {
    doc.line(m, y, m + 60, y)
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Firma del paciente', m, y)
    y += 10
    doc.line(m, y, m + 60, y)
    y += 5
    doc.text('Firma del médico', m, y)
  } else {
    doc.line(m, y, m + 60, y)
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Firma del médico', m, y)
  }

  doc.save(filename)
}
