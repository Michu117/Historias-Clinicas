/**
 * Test Suite: ProfessionalSelector Component
 * HU-01: Agendar Cita - Paso 2 Seleccionar Profesional
 * Red Phase - Tests esperando que fallen inicialmente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfessionalSelector } from '../../component/selectors/ProfessionalSelector';
import { Profesional } from '../../types';

// Mock data
const mockProfesionales: Profesional[] = [
  {
    id: 101,
    nombre: 'Dr. Carlos García',
    email: 'carlos.garcia@hospital.com',
    especialidad: 'Medicina',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
  {
    id: 102,
    nombre: 'Dra. María López',
    email: 'maria.lopez@hospital.com',
    especialidad: 'Medicina',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
  {
    id: 103,
    nombre: 'Dr. Inactivo',
    email: 'inactivo@hospital.com',
    especialidad: 'Medicina',
    rol: 'PROFESIONAL',
    is_activo: false,
  },
];

describe('ProfessionalSelector Component', () => {
  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSelect = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar el dropdown con label', () => {
      render(
        <ProfessionalSelector
          profesionales={mockProfesionales}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      expect(screen.getByText(/selecciona un profesional/i)).toBeInTheDocument();
    });

    it('debe mostrar solo profesionales activos (is_activo=true)', () => {
      render(
        <ProfessionalSelector
          profesionales={mockProfesionales}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Profesionales activos
      expect(screen.getByText('Dr. Carlos García')).toBeInTheDocument();
      expect(screen.getByText('Dra. María López')).toBeInTheDocument();

      // Profesional inactivo NO debe mostrarse
      expect(screen.queryByText('Dr. Inactivo')).not.toBeInTheDocument();
    });

    it('debe mostrar loading spinner cuando isLoading=true', () => {
      render(
        <ProfessionalSelector
          profesionales={[]}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />
      );

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  describe('Selección', () => {
    it('debe ejecutar onSelect cuando se selecciona un profesional', async () => {
      render(
        <ProfessionalSelector
          profesionales={mockProfesionales}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '101' } });

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(101);
      });
    });

    it('debe mostrar el profesional seleccionado', () => {
      render(
        <ProfessionalSelector
          profesionales={mockProfesionales}
          selectedProfessionalId={101}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('101');
    });
  });

  describe('Estados', () => {
    it('debe deshabilitar el select cuando isLoading=true', () => {
      render(
        <ProfessionalSelector
          profesionales={mockProfesionales}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it('debe deshabilitar el select cuando no hay profesionales', () => {
      render(
        <ProfessionalSelector
          profesionales={[]}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it('debe mostrar mensaje cuando no hay profesionales disponibles', () => {
      render(
        <ProfessionalSelector
          profesionales={[]}
          selectedProfessionalId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      expect(screen.getByText(/no hay profesionales disponibles/i)).toBeInTheDocument();
    });
  });
});
