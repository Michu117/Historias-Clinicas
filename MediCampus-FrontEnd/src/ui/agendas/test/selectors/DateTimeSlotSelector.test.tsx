/**
 * Test Suite: DateTimeSlotSelector Component
 * HU-01: Agendar Cita - Paso 3 Seleccionar Fecha y Hora
 * Red Phase - Tests esperando que fallen inicialmente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DateTimeSlotSelector } from '../../component/selectors/DateTimeSlotSelector';
import { Cita, EstadoCita } from '../../types';

// Mock data
const mockCitasExistentes: Cita[] = [
  {
    id: 1,
    paciente_id: 1,
    profesional_id: 101,
    servicio_id: 1,
    servicios_ids: [1],
    fecha: '2026-05-28',
    hora: '10:00',
    duracion_minutos: 30,
    margen_minutos: 30,
    estado: EstadoCita.AGENDADA,
    motivo: 'Consulta de rutina',
    notas: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('DateTimeSlotSelector Component', () => {
  let mockOnSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSelect = vi.fn();
  });

  describe('Rendering', () => {
    it('debe renderizar selector de fecha y hora', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      expect(screen.getByText(/selecciona una fecha/i)).toBeInTheDocument();
      expect(screen.getByText(/selecciona una hora/i)).toBeInTheDocument();
    });

    it('debe mostrar loading spinner cuando isLoading=true', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />
      );

      expect(screen.getByText(/cargando horarios/i)).toBeInTheDocument();
    });
  });

  describe('Validación de Fechas (RN-001)', () => {
    it('debe deshabilitar fechas pasadas', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Fecha pasada debería estar deshabilitada
      const pastDate = screen.queryByTestId('date-2026-05-26');
      if (pastDate) {
        expect((pastDate as HTMLInputElement).disabled).toBe(true);
      }
    });

    it('debe permitir fechas futuras (mínimo 1 día adelante)', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Fecha mañana debería estar habilitada
      const futureDate = screen.getByTestId('date-2026-05-28');
      expect((futureDate as HTMLInputElement).disabled).toBe(false);
    });

    it('debe permitir agendar hasta 90 días adelante', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Fecha dentro del rango (90 días) debería estar habilitada
      const validDate = screen.getByTestId('date-2026-08-25');
      expect((validDate as HTMLInputElement).disabled).toBe(false);
    });

    it('debe deshabilitar fechas fuera del rango de 90 días', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Fecha muy lejana debería estar deshabilitada
      const tooFarDate = screen.queryByTestId('date-2026-09-01');
      if (tooFarDate) {
        expect((tooFarDate as HTMLInputElement).disabled).toBe(true);
      }
    });
  });

  describe('Filtrado de Horarios', () => {
    it('debe mostrar solo horarios disponibles (sin conflictos)', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={mockCitasExistentes}
          selectedDate="2026-05-28"
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Horario con conflicto (10:00 - cita existente) debe estar deshabilitado
      const conflictTime = screen.queryByTestId('time-10:00');
      if (conflictTime) {
        expect((conflictTime as HTMLOptionElement).disabled).toBe(true);
      }

      // Horario sin conflicto (14:00) debe estar habilitado
      const availableTime = screen.getByTestId('time-14:00');
      expect((availableTime as HTMLOptionElement).disabled).toBe(false);
    });

    it('debe considerar margen de tiempo entre citas (RN-002)', () => {
      // Cita existente: 10:00-10:30 (duracion: 30) con margen 30 minutos
      // Próxima cita disponible desde: 11:00
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={mockCitasExistentes}
          selectedDate="2026-05-28"
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // 10:30 (fin de cita + margen) debe estar deshabilitado
      const marginTime = screen.queryByTestId('time-10:30');
      if (marginTime) {
        expect((marginTime as HTMLOptionElement).disabled).toBe(true);
      }
    });

    it('debe respetar horario de atención (08:00 - 18:00)', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate="2026-05-28"
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Horas fuera del rango deben estar deshabilitadas
      const beforeStart = screen.queryByTestId('time-07:00');
      const afterEnd = screen.queryByTestId('time-19:00');

      if (beforeStart) expect((beforeStart as HTMLOptionElement).disabled).toBe(true);
      if (afterEnd) expect((afterEnd as HTMLOptionElement).disabled).toBe(true);
    });

    it('debe excluir descanso (12:00 - 13:00)', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate="2026-05-28"
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      // Horarios en descanso deben estar deshabilitados
      const breakTime = screen.queryByTestId('time-12:30');
      if (breakTime) {
        expect((breakTime as HTMLOptionElement).disabled).toBe(true);
      }
    });
  });

  describe('Selección', () => {
    it('debe ejecutar onSelect cuando se selecciona fecha y hora', async () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate={null}
          selectedTime={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const dateInput = screen.getByTestId('date-picker');
      const timeSelect = screen.getByTestId('time-picker');

      fireEvent.change(dateInput, { target: { value: '2026-05-28' } });
      fireEvent.change(timeSelect, { target: { value: '14:00' } });

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith({
          fecha: '2026-05-28',
          hora: '14:00',
        });
      });
    });

    it('debe mostrar fecha y hora seleccionadas', () => {
      render(
        <DateTimeSlotSelector
          profesionalId={101}
          servicioId={1}
          citasExistentes={[]}
          selectedDate="2026-05-28"
          selectedTime="14:00"
          onSelect={mockOnSelect}
          isLoading={false}
        />
      );

      const dateInput = screen.getByTestId('date-picker') as HTMLInputElement;
      const timeSelect = screen.getByTestId('time-picker') as HTMLSelectElement;

      expect(dateInput.value).toBe('2026-05-28');
      expect(timeSelect.value).toBe('14:00');
    });
  });
});
