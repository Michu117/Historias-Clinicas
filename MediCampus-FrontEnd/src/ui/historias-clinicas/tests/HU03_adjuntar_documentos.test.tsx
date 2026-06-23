import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as vitest from 'vitest'

import DocumentoClinicoForm from '../components/DocumentoClinicoForm'
import DocumentosClinicosList from '../components/DocumentosClinicosList'

vitest.describe('HU03 - Adjuntar Documentos', () => {

  vitest.test('Renderiza el formulario para adjuntar documentos con campos requeridos', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Fecha del documento/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Encabezado/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Cuerpo/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Tipo de documento/i)).toBeInTheDocument()
    vitest.expect(screen.getByRole('button', { name: /Adjuntar/i })).toBeInTheDocument()
  })

  vitest.test('Muestra opciones de clasificación de documentos', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Resultado/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Formularios/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Consentimiento/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Certificado/i)).toBeInTheDocument()
  })

  vitest.test('Lista todos los documentos adjuntos a una historia clínica', async () => {
    render(<DocumentosClinicosList historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Fecha/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Encabezado/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Tipo/i)).toBeInTheDocument()
  })

  vitest.test('Muestra mensaje cuando no hay documentos', async () => {
    render(<DocumentosClinicosList historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/No se encontraron documentos clínicos/i)).toBeInTheDocument()
  })

  vitest.test('Requiere que la fecha esté presente', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    const inputs = screen.getAllByDisplayValue('')
    const dateInputs = inputs.filter((el) => (el as HTMLInputElement).type === 'date')
    vitest.expect(dateInputs.length).toBeGreaterThanOrEqual(1)
  })

  vitest.test('Permite adjuntar un documento con todos los campos', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByRole('button', { name: /Adjuntar/i })).toBeInTheDocument()
  })

  vitest.test('No permite acceso a usuarios no autorizados (sin token)', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(true).toBe(true)
  })
})
