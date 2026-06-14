/**
 * Test Suite: ServiceSelector Component
 * HU-01: Agendar Cita - Paso 1 Seleccionar Servicio
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceSelector } from '../../component/selectors/ServiceSelector';
import { Servicio } from '../../types';

// Mock data
const mockServicios: Servicio[] = [
  {
    id: 1,
    nombre: 'Cardiología',
    descripcion: 'Especialidad del corazón',
    es_activo: true,
    profesionales: [{ id: 101, nombre: 'Dr. García', email: 'dr.garcia@hospital.com', is_activo: true, rol: 'PROFESIONAL' }],
  },
  {
    id: 2,
    nombre: 'Dermatología',
    descripcion: 'Especialidad de la piel',
    es_activo: true,
    profesionales: [{ id: 102, nombre: 'Dra. López', email: 'dra.lopez@hospital.com', is_activo: true, rol: 'PROFESIONAL' }],
  },
  {
    id: 3,
    nombre: 'Oftalmología',
    descripcion: 'Especialidad de los ojos',
    es_activo: false,
    profesionales: [],
  },
];

describe('ServiceSelector Component', () => {
  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSelect = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar el dropdown con label', () => {
      render(
        <ServiceSelector
          servicios={mockServicios}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      expect(screen.getByText(/selecciona un servicio/i)).toBeInTheDocument();
    });

    it('debe mostrar solo servicios activos (es_activo=true)', () => {
      render(
        <ServiceSelector
          servicios={mockServicios}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      expect(screen.getByText('Cardiología')).toBeInTheDocument();
      expect(screen.getByText('Dermatología')).toBeInTheDocument();
      expect(screen.queryByText('Oftalmología')).not.toBeInTheDocument();
    });

    it('debe mostrar loading spinner cuando isLoading=true', () => {
      render(
        <ServiceSelector
          servicios={[]}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />
      );

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  describe('Selección', () => {
    it('debe ejecutar onSelect cuando se selecciona un servicio', async () => {
      render(
        <ServiceSelector
          servicios={mockServicios}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith(1);
      });
    });

    it('debe mostrar el servicio seleccionado', () => {
      render(
        <ServiceSelector
          servicios={mockServicios}
          selectedServiceId={1}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('1');
    });
  });

  describe('Estados', () => {
    it('debe deshabilitar el select cuando isLoading=true', () => {
      render(
        <ServiceSelector
          servicios={mockServicios}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });

    it('debe deshabilitar el select cuando no hay servicios', () => {
      render(
        <ServiceSelector
          servicios={[]}
          selectedServiceId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });
  });
});
