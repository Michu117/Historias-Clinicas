import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable
)
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame


def generar_pdf_certificado(cita, paciente_nombre, paciente_cedula,
                            profesional_nombre, profesional_cedula,
                            especialidad, observaciones):
    buf = io.BytesIO()

    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=2*cm,
        bottomMargin=2*cm,
        leftMargin=2.5*cm,
        rightMargin=2.5*cm,
    )

    styles = getSampleStyleSheet()
    primary_color = HexColor('#1a5276')
    dark_color = HexColor('#1a1a1a')
    muted_color = HexColor('#888888')

    title_style = ParagraphStyle(
        'CertTitle', parent=styles['Heading1'],
        fontSize=22, textColor=primary_color,
        alignment=TA_CENTER, spaceAfter=4,
        fontName='Helvetica-Bold',
    )
    subtitle_style = ParagraphStyle(
        'CertSubtitle', parent=styles['Normal'],
        fontSize=11, textColor=HexColor('#555555'),
        alignment=TA_CENTER, spaceAfter=20,
    )
    cert_label_style = ParagraphStyle(
        'CertLabel', parent=styles['Heading2'],
        fontSize=16, textColor=primary_color,
        alignment=TA_CENTER, spaceAfter=24,
        fontName='Helvetica-Bold',
    )
    cell_label_style = ParagraphStyle(
        'CellLabel', parent=styles['Normal'],
        fontSize=10, textColor=primary_color,
        fontName='Helvetica-Bold',
        alignment=TA_LEFT,
    )
    cell_value_style = ParagraphStyle(
        'CellValue', parent=styles['Normal'],
        fontSize=10, textColor=dark_color,
        alignment=TA_LEFT,
    )
    obs_style = ParagraphStyle(
        'Observaciones', parent=styles['Normal'],
        fontSize=10, textColor=HexColor('#444444'),
        alignment=TA_LEFT,
        fontName='Helvetica-Oblique',
        leftIndent=10, rightIndent=10,
        spaceBefore=6, spaceAfter=6,
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=9, textColor=muted_color,
        alignment=TA_CENTER, spaceBefore=8,
    )
    stamp_style = ParagraphStyle(
        'Stamp', parent=styles['Normal'],
        fontSize=11, textColor=HexColor('#555555'),
        alignment=TA_CENTER, spaceBefore=4,
    )

    fecha_atencion = cita.fecha_hora.strftime('%d/%m/%Y') if cita.fecha_hora else '—'
    hora_atencion = cita.fecha_hora.strftime('%H:%M') if cita.fecha_hora else '—'
    fecha_emision = datetime.now().strftime('%d/%m/%Y %H:%M')
    motivo = cita.motivo or 'No especificado'

    elements = []

    elements.append(Paragraph('MediCampus', title_style))
    elements.append(Paragraph('Sistema Integral de Salud', subtitle_style))
    elements.append(HRFlowable(width='80%', thickness=2, color=primary_color, spaceAfter=16))
    elements.append(Paragraph('Certificado de Atención Médica', cert_label_style))

    data = [
        [Paragraph('Paciente', cell_label_style),
         Paragraph(paciente_nombre or 'No registrado', cell_value_style)],
        [Paragraph('Cédula', cell_label_style),
         Paragraph(paciente_cedula or 'No disponible', cell_value_style)],
        [Paragraph('Atendido por', cell_label_style),
         Paragraph(profesional_nombre or 'No registrado', cell_value_style)],
        [Paragraph('Especialidad', cell_label_style),
         Paragraph(especialidad or 'No especificada', cell_value_style)],
        [Paragraph('Fecha de atención', cell_label_style),
         Paragraph(f'{fecha_atencion}', cell_value_style)],
        [Paragraph('Hora', cell_label_style),
         Paragraph(f'{hora_atencion}', cell_value_style)],
        [Paragraph('Motivo', cell_label_style),
         Paragraph(motivo, cell_value_style)],
    ]

    col_widths = [4.5*cm, 9*cm]
    table = Table(data, colWidths=col_widths, hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), HexColor('#f0f4f8')),
        ('BOX', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, HexColor('#cccccc')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    if observaciones:
        elements.append(Spacer(1, 16))
        elements.append(HRFlowable(width='4%', thickness=4, color=primary_color, spaceAfter=8, spaceBefore=4))
        elements.append(Paragraph(f'<b>Observaciones:</b><br/>{observaciones}', obs_style))

    elements.append(Spacer(1, 40))
    elements.append(HRFlowable(width='40%', thickness=1, color=dark_color, spaceAfter=4, spaceBefore=20))
    elements.append(Paragraph('Firma del profesional', stamp_style))

    elements.append(Spacer(1, 30))
    elements.append(HRFlowable(width='80%', thickness=0.5, color=HexColor('#cccccc'), spaceAfter=8))
    elements.append(Paragraph(f'Documento generado por MediCampus el {fecha_emision}', footer_style))
    elements.append(Paragraph('Este certificado es válido como constancia de atención médica.', footer_style))

    doc.build(elements)
    buf.seek(0)
    return buf
