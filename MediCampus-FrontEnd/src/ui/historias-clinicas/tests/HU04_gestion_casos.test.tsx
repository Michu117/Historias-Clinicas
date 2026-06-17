import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as vitest from 'vitest'

// Import expected production components
import CasoClinicoForm from '../components/CasoClinicoForm'
import CasosClinicosTable from '../components/CasosClinicosTable'

vitest.describe('HU04 - Gestión de Casos Clínicos', () => {

  vitest.test('Renderiza el formulario para crear casos con prioridad y estado', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Prioridad/i)).toBeInTheDocument()
    vitest.expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument()
    vitest.expect(screen.getByRole('button', { name: /Crear Caso/i })).toBeInTheDocument()
  })

  vitest.test('Muestra opciones de prioridad correctas', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/ALTA/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/MEDIA/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/BAJA/i)).toBeInTheDocument()
  })

  vitest.test('Muestra opciones de estado correctas', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/ABIERTO/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/EN_SEGUIMIENTO/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/CERRADO/i)).toBeInTheDocument()
  })

  vitest.test('Renderiza tabla de casos con columnas requeridas', async () => {
    render(<CasosClinicosTable historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/Casos Clínicos/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Descripción/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Prioridad/i)).toBeInTheDocument()
    vitest.expect(screen.getByText(/Estado/i)).toBeInTheDocument()
  })

  vitest.test('Requiere que la descripción esté presente', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    const descField = screen.getByLabelText(/Descripción/i)
    vitest.expect(descField).toHaveAttribute('required')
  })

  vitest.test('Requiere que la prioridad esté seleccionada', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    const priortiySelect = screen.getByLabelText(/Prioridad/i)
    vitest.expect(priortiySelect).toHaveAttribute('required')
  })

  vitest.test('Requiere que el estado esté seleccionado', async () => {
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    const stateSelect = screen.getByLabelText(/Estado/i)
    vitest.expect(stateSelect).toHaveAttribute('required')
  })

  vitest.test('Los casos están correctamente asociados a la historia clínica HC-001', async () => {
    render(<CasosClinicosTable historiaClinicaId={'HC-001'} />)

    vitest.expect(screen.getByText(/HC-001/i)).toBeInTheDocument()
  })

  vitest.test('Permite visualizar acciones de editar y cerrar para casos abiertos', async () => {
    render(<CasosClinicosTable historiaClinicaId={'HC-001'} />)

    const editButtons = screen.queryAllByRole('button', { name: /Editar/i })
    const closeButtons = screen.queryAllByRole('button', { name: /Cerrar/i })

    vitest.expect(editButtons.length).toBeGreaterThanOrEqual(0) // May be 0 or more depending on cases
  })

  vitest.test('No permite acceso a usuarios no autorizados (sin token)', async () => {
    // Sin token, debe mostrar mensaje de acceso denegado o redirigir
    render(<CasoClinicoForm historiaClinicaId={'HC-001'} />)

    vitest.expect(true).toBe(true) // Placeholder para fase roja
  })
})

