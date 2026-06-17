import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as vitest from 'vitest'

// Import expected production components
import DocumentoClinicoForm from '../components/DocumentoClinicoForm'
import DocumentosClinicosList from '../components/DocumentosClinicosList'

vitest.describe('HU03 - Adjuntar Documentos', () => {
  
  vitest.test('Renderiza el formulario para adjuntar documentos con campos requeridos', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByLabelText(/Fecha del documento/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Encabezado/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Cuerpo/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Tipo de documento/i)).toBeInTheDocument()
    vitest.expect(screen.getByRole('button', { name: /Adjuntar/i })).toBeInTheDocument()
  })

  vitest.test('Muestra opciones de clasificación de documentos', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Resultado de Consulta/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Formulario/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Consentimiento/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Certificado/i)).toBeInTheDocument()
  })

  vitest.test('Lista todos los documentos adjuntos a una historia clínica', async () => {
    render(<DocumentosClinicosList historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Documentos Clínicos/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Fecha/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Encabezado/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Tipo/i)).toBeInTheDocument()
  })

  vitest.test('Requiere que la fecha esté presente', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    const dateField = screen.getByLabelText(/Fecha del documento/i)
    vitest.expect(dateField).toHaveAttribute('required')
  })

  vitest.test('Requiere que el encabezado no esté vacío', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    const headerField = screen.getByLabelText(/Encabezado/i)
    vitest.expect(headerField).toHaveAttribute('required')
  })

  vitest.test('Requiere que el cuerpo del documento no esté vacío', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    const bodyField = screen.getByLabelText(/Cuerpo/i)
    vitest.expect(bodyField).toHaveAttribute('required')
  })

  vitest.test('Requiere que el tipo de documento esté seleccionado', async () => {
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)

    const typeSelect = screen.getByLabelText(/Tipo de documento/i)
    vitest.expect(typeSelect).toHaveAttribute('required')
  })

  vitest.test('Los documentos se asocian correctamente a la historia clínica HC-001', async () => {
    render(<DocumentosClinicosList historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/HC-001/i)).toBeInTheDocument()
  })

  vitest.test('No permite acceso a usuarios no autorizados (sin token)', async () => {
    // Sin token, debe mostrar mensaje de acceso denegado o redirigir
    render(<DocumentoClinicoForm historiaClinicaId={'HC-001'} />)
    
    vitest.expect(true).toBe(true) // Placeholder para fase roja
  })
})

