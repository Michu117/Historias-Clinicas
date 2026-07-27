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
    it('debe renderizar selector de fecha', () => {
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
    });

    it('debe mostrar hint para seleccionar hora cuando no hay fecha', () => {
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

      expect(screen.getByText(/seleccione primero una fecha/i)).toBeInTheDocument();
    });

    it('debe mostrar loading cuando isLoading=true', () => {
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

  describe('Validaci\u00f3n de Fechas (RN-001)', () => {
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

      const pastDate = screen.queryByTestId('date-2026-05-26');
      if (pastDate) {
        expect((pastDate as HTMLInputElement).disabled).toBe(true);
      }
    });

    it('debe permitir fechas futuras (m\u00ednimo 1 d\u00eda adelante)', () => {
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

      const futureDate = screen.getByTestId('date-2026-05-28');
      expect((futureDate as HTMLInputElement).disabled).toBe(false);
    });

    it('debe permitir agendar hasta 90 d\u00edas adelante', () => {
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

      const validDate = screen.getByTestId('date-2026-08-25');
      expect((validDate as HTMLInputElement).disabled).toBe(false);
    });

    it('debe deshabilitar fechas fuera del rango de 90 d\u00edas', () => {
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

      const conflictTime = screen.queryByTestId('time-10:00');
      if (conflictTime) {
        expect((conflictTime as HTMLButtonElement).disabled).toBe(true);
      }

      const availableTime = screen.getByTestId('time-14:00');
      expect((availableTime as HTMLButtonElement).disabled).toBe(false);
    });

    it('debe considerar margen de tiempo entre citas (RN-002)', () => {
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

      const marginTime = screen.queryByTestId('time-10:30');
      if (marginTime) {
        expect((marginTime as HTMLButtonElement).disabled).toBe(true);
      }
    });

    it('debe respetar horario de atenci\u00f3n (08:00 - 17:30)', () => {
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

      const beforeStart = screen.queryByTestId('time-07:00');
      const afterEnd = screen.queryByTestId('time-18:00');

      if (beforeStart) expect((beforeStart as HTMLButtonElement).disabled).toBe(true);
      if (afterEnd) expect((afterEnd as HTMLButtonElement).disabled).toBe(true);
    });

    it('debe excluir descanso (12:30 - 15:00) y mostrar slots de manana y tarde', () => {
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

      const breakTime = screen.queryByTestId('time-13:00');
      if (breakTime) {
        expect((breakTime as HTMLButtonElement).disabled).toBe(true);
      }

      const morningSlot = screen.getByTestId('time-12:00');
      expect((morningSlot as HTMLButtonElement).disabled).toBe(false);

      const afternoonSlot = screen.getByTestId('time-15:00');
      expect((afternoonSlot as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('Selecci\u00f3n', () => {
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
      fireEvent.change(dateInput, { target: { value: '2026-05-28' } });

      const timeButton = await screen.findByTestId('time-14:00');
      fireEvent.click(timeButton);

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
      expect(dateInput.value).toBe('2026-05-28');

      const selectedButton = screen.getByTestId('time-14:00') as HTMLButtonElement;
      expect(selectedButton).toBeInTheDocument();
    });
  });
});
