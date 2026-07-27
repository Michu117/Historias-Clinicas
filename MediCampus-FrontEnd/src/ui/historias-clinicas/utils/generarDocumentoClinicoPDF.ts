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

const TEAL = '#0d9488'
const TEAL_LIGHT = '#e6f7f5'
const GRAY_BG = '#fafafa'
const GRAY_BORDER = '#e5e7eb'
const GRAY_MUTED = '#6b7280'
const DARK_TEXT = '#1f2937'

interface GenerarPDFParams {
  documento: DocumentoClinico
  historia: HistoriaClinica
  medicoNombre: string
  caso?: ConsultaClinico | null
}

function sanitize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

function addFooter(doc: jsPDF, pageNum: number, dateStr: string): void {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(156, 163, 175)
  doc.text(`MediCampus — Generado: ${dateStr} — Página ${pageNum}`, pw / 2, ph - 12, { align: 'center' })
  doc.setTextColor(0, 0, 0)
}

function checkPage(doc: jsPDF, y: number, needed: number, m: number, pageNum: number, dateStr: string): { y: number; pageNum: number } {
  const ph = doc.internal.pageSize.getHeight()
  if (y + needed > ph - 25) {
    addFooter(doc, pageNum, dateStr)
    doc.addPage()
    pageNum++
    y = 25
  }
  return { y, pageNum }
}

export function generarDocumentoClinicoPDF({ documento, historia, medicoNombre, caso }: GenerarPDFParams) {
  const doc = new jsPDF()
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()
  const m = 20
  let y = m
  let pageNum = 1
  const dateStr = new Date().toLocaleDateString('es-EC', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const paciente = historia.usuario
  const tipoRaw = documento.tipo
  const tipoLabel = TIPO_LABELS[tipoRaw] ?? tipoRaw

  // ── Header teal bar ──
  doc.setFillColor(13, 148, 136)
  doc.rect(0, 0, pw, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('MEDICAMPUS', pw / 2, 18, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(tipoLabel, pw / 2, 30, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y = 48

  // ── Title ──
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(13, 148, 136)
  doc.text(tipoLabel, pw / 2, y, { align: 'center' })
  y += 10
  doc.setTextColor(0, 0, 0)

  // ── Divider ──
  doc.setDrawColor(13, 148, 136)
  doc.setLineWidth(0.8)
  doc.line(m, y, pw - m, y)
  y += 8

  // ── Date ──
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(107, 114, 128)
  doc.text(`Generado: ${dateStr}`, m, y)
  y += 6
  doc.setTextColor(0, 0, 0)

  // ── Filename ──
  const nameSlug = sanitize(paciente.nombre || '')
  const idSlug = sanitize(paciente.identificacion || '')
  const dateSlug = new Date().toISOString().split('T')[0]
  let filename = ''

  if (tipoRaw === 'RESULTADO') {
    filename = `Resultado_${nameSlug || idSlug || historia.id}_${dateSlug}.pdf`
  } else if (tipoRaw === 'CERTIFICADO') {
    filename = `Certificado_${nameSlug || idSlug || historia.id}_${dateSlug}.pdf`
  } else if (tipoRaw === 'CONSENTIMIENTO') {
    filename = `Consentimiento_${nameSlug || idSlug || historia.id}_${dateSlug}.pdf`
  } else {
    filename = `Formulario_${nameSlug || idSlug || historia.id}_${dateSlug}.pdf`
  }

  // ── Helper: section card ──
  const sectionCard = (title: string, lines: { label: string; value: string }[]) => {
    const cardH = 18 + lines.length * 7
    ;({ y, pageNum } = checkPage(doc, y, cardH, m, pageNum, dateStr))

    doc.setFillColor(250, 250, 250)
    doc.setDrawColor(229, 231, 235)
    doc.roundedRect(m, y, pw - m * 2, cardH, 2, 2, 'FD')
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(13, 148, 136)
    doc.text(title, m + 6, y + 7)
    y += 13

    lines.forEach(({ label, value }) => {
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(75, 85, 99)
      doc.text(label, m + 8, y)
      const labelW = doc.getTextWidth(label + ':  ')
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(31, 41, 55)
      const valLines = doc.splitTextToSize(value, pw - m * 2 - labelW - 30)
      doc.text(valLines, m + 8 + labelW, y)
      y += 5.5 * valLines.length
    })

    y += 2
  }

  const addField = (label: string, value: string | null | undefined) => {
    if (!value || !value.trim()) return
    sectionCard(label, [{ label, value }])
  }

  // ── Datos paciente ──
  const patientFields: { label: string; value: string }[] = [
    { label: 'Paciente', value: paciente.nombre },
  ]
  if (paciente.identificacion) patientFields.push({ label: 'Identificación', value: paciente.identificacion })
  patientFields.push({ label: 'Fecha de emisión', value: documento.fecha })
  sectionCard('DATOS DEL PACIENTE', patientFields)

  // ── Caso asociado ──
  if (tipoRaw === 'RESULTADO') {
    if (caso) {
      const caseFields: { label: string; value: string }[] = [
        { label: 'Fecha', value: caso.fecha },
        { label: 'Motivo', value: caso.motivo },
        { label: 'Tipo', value: caso.tipo },
        { label: 'Estado', value: caso.estado },
      ]
      if (caso.observaciones) caseFields.push({ label: 'Observaciones', value: caso.observaciones })
      sectionCard('CASO CLÍNICO ASOCIADO', caseFields)
    } else {
      sectionCard('CASO CLÍNICO ASOCIADO', [{ label: 'Nota', value: 'No se seleccionó caso clínico asociado.' }])
    }
  }

  // ── Certificado / Consentimiento text ──
  if (tipoRaw === 'CERTIFICADO') {
    addField('Certificación', `Se certifica que el/la paciente ${paciente.nombre}, con identificación ${paciente.identificacion}, fue atendido/a en MediCampus.`)
  } else if (tipoRaw === 'CONSENTIMIENTO') {
    addField('Declaración', 'El/la paciente declara haber sido informado/a sobre la atención, procedimiento o indicación descrita en este documento.')
  }

  // ── Encabezado ──
  addField('Encabezado', documento.encabezado)

  // ── Cuerpo ──
  addField('Cuerpo', documento.cuerpo)

  // ── Médico ──
  addField('Médico Responsable', medicoNombre)

  // ── Firmas ──
  ;({ y, pageNum } = checkPage(doc, y, 50, m, pageNum, dateStr))
  y = Math.max(y, ph - 70)

  doc.setDrawColor(31, 41, 55)
  doc.setLineWidth(0.5)

  if (tipoRaw === 'CONSENTIMIENTO') {
    // Firma paciente
    doc.line(m, y, m + 65, y)
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text('Firma del paciente', m, y)
    y += 14

    // Firma médico
    doc.line(m, y, m + 65, y)
    y += 5
    doc.text('Firma del médico', m, y)
  } else {
    doc.line(m, y, m + 65, y)
    y += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(75, 85, 99)
    doc.text('Firma del médico', m, y)
  }

  // ── Footer last page ──
  addFooter(doc, pageNum, dateStr)

  doc.save(filename)
}
