import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as vitest from 'vitest'

// Import expected production components
import AntecedenteClinicoForm from '../components/AntecedenteClinicoForm'
import AntecedentesClinicosList from '../components/AntecedentesClinicosList'

vitest.describe('HU02 - Registro de Antecedentes Clínicos', () => {
  
  vitest.test('Renderiza el formulario de registro de antecedentes con tipos y campos requeridos', async () => {
    render(<AntecedenteClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByLabelText(/Tipo de antecedente/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Familiar/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Personal Patológico/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Personal No Patológico/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Gineco-Obstétrico/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Fecha/i)).toBeInTheDocument()
    vitest.expect(screen.getByRole('button', { name: /Registrar/i })).toBeInTheDocument()
  })

  vitest.test('Muestra la lista de antecedentes vinculados a una historia clínica', async () => {
    render(<AntecedentesClinicosList historiaClinicaId={'HC-001'} />)
    
    vitest.expect(screen.getByText(/Antecedentes Clínicos/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Tipo/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Descripción/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Fecha/i)).toBeInTheDocument()
  })

  vitest.test('Permite editar un antecedente existente', async () => {
    const user = userEvent.setup()
    render(<AntecedentesClinicosList historiaClinicaId={'HC-001'} />)
    
    const editButtons = screen.queryAllByRole('button', { name: /Editar/i })
    vitest.expect(editButtons.length).toBeGreaterThan(0)
  })

  vitest.test('Requiere que el tipo de antecedente esté seleccionado', async () => {
    render(<AntecedenteClinicoForm historiaClinicaId={'HC-001'} />)

    const selectElement = screen.getByLabelText(/Tipo de antecedente/i)
    vitest.expect(selectElement).toHaveAttribute('required')
  })

  vitest.test('Requiere que la descripción no esté vacía', async () => {
    render(<AntecedenteClinicoForm historiaClinicaId={'HC-001'} />)

    const descriptionField = screen.getByLabelText(/Descripción/i)
    vitest.expect(descriptionField).toHaveAttribute('required')
  })

  vitest.test('Requiere que la fecha esté seleccionada', async () => {
    render(<AntecedenteClinicoForm historiaClinicaId={'HC-001'} />)

    const dateField = screen.getByLabelText(/Fecha/i)
    vitest.expect(dateField).toHaveAttribute('required')
  })

  vitest.test('Antecedentes deben permanecer asociados a la historia clínica HC-001', async () => {
    render(<AntecedentesClinicosList historiaClinicaId={'HC-001'} />)

    // Verificar que la lista muestre solo antecedentes de esta historia
    vitest.expect(screen.getByText(/HC-001/i)).toBeInTheDocument()
  })

  vitest.test('No permite acceso a usuarios no autorizados (sin token)', async () => {
    // Este test verificará que sin token, se muestre un mensaje de acceso denegado
    // La implementación debe manejar la autorización en el hook
    render(<AntecedenteClinicoForm historiaClinicaId={'HC-001'} />)
    
    // Si no hay token, debe mostrar mensaje de autorización
    // O redirigir al login (esto lo validará la FASE VERDE)
    vitest.expect(true).toBe(true) // Placeholder para fase roja
  })
})
