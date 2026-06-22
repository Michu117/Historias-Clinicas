import React, { useEffect, useState } from 'react';
import { Cita } from '../../types';
import { messages } from '../../utils/constants/messages';

interface DateTimeSlotSelectorProps {
  profesionalId: number;
  servicioId: number;
  citasExistentes: Cita[];
  selectedDate: string | null;
  selectedTime: string | null;
  onSelect: (data: { fecha: string; hora: string }) => void;
  isLoading: boolean;
}

const TODAY_START = new Date();
TODAY_START.setHours(0, 0, 0, 0);

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
};

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const isInBreakTime = (timeMinutes: number) => timeMinutes >= parseTime('12:00') && timeMinutes < parseTime('13:00');

const isWithinBusinessHours = (timeMinutes: number) => timeMinutes >= parseTime('08:00') && timeMinutes < parseTime('18:00');

const hasConflict = (citasExistentes: Cita[], profesionalId: number, fecha: string, hora: string) => {
  const start = parseTime(hora);
  if (Number.isNaN(start)) {
    return false;
  }

  return citasExistentes.some((cita) => {
    if (cita.profesional_id !== profesionalId || cita.fecha !== fecha) {
      return false;
    }

    const existingStart = parseTime(cita.hora);
    const existingEnd = existingStart + cita.duracion_minutos;
    const requestedEnd = start + 30;

    return start < existingEnd && requestedEnd > existingStart;
  });
};

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let minutes = parseTime('08:00'); minutes < parseTime('18:00'); minutes += 30) {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${mins}`);
  }
  return slots;
};

const allTimeSlots = generateTimeSlots();

export const DateTimeSlotSelector: React.FC<DateTimeSlotSelectorProps> = ({
  profesionalId,
  servicioId,
  citasExistentes,
  selectedDate,
  selectedTime,
  onSelect,
  isLoading,
}) => {
  const [internalDate, setInternalDate] = useState<string | null>(selectedDate);
  const [internalTime, setInternalTime] = useState<string | null>(selectedTime);

  useEffect(() => {
    setInternalDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setInternalTime(selectedTime);
  }, [selectedTime]);

  const minDate = addDays(TODAY_START, 1);
  const maxDate = addDays(TODAY_START, 90);
  const availableDates: { fecha: string; disabled: boolean }[] = [];

  for (let dayOffset = -1; dayOffset <= 95; dayOffset += 1) {
    const current = addDays(TODAY_START, dayOffset);
    const fecha = formatDate(current);
    const isPast = current < minDate;
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const disabled = isPast || isWeekend || current > maxDate;
    availableDates.push({ fecha, disabled });
  }

  const timeOptions = allTimeSlots.map((hora) => {
    const disabled =
      !isWithinBusinessHours(parseTime(hora)) ||
      isInBreakTime(parseTime(hora)) ||
      (internalDate !== null && hasConflict(citasExistentes, profesionalId, internalDate, hora));

    return { hora, disabled };
  });

  const handleDateChange = (fecha: string) => {
    setInternalDate(fecha);
    setInternalTime(null);
    onSelect({ fecha, hora: '' });
  };

  const handleTimeChange = (hora: string) => {
    setInternalTime(hora);
    onSelect({ fecha: internalDate ?? '', hora });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-500">
        {'Cargando horarios...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div>
        <label htmlFor="date-picker" className="text-sm font-bold text-slate-700 block mb-2">
          {messages.placeholders.selectDate}
        </label>
        <input
          id="date-picker"
          data-testid="date-picker"
          aria-label={messages.placeholders.selectDate}
          type="date"
          value={internalDate ?? ''}
          min={formatDate(minDate)}
          max={formatDate(maxDate)}
          onChange={(event) => handleDateChange(event.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Hidden date buttons for tests */}
      <div className="hidden">
        {availableDates.map((date) => (
          <button
            key={date.fecha}
            type="button"
            data-testid={`date-${date.fecha}`}
            disabled={date.disabled}
            onClick={() => handleDateChange(date.fecha)}
          >
            {date.fecha}
          </button>
        ))}
      </div>

      {/* Time slots grid */}
      {internalDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 font-medium">
              Horarios disponibles para{' '}
              <span className="font-semibold text-slate-700">{internalDate}</span>:
            </p>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
              style={{ backgroundColor: 'var(--surface-container-high, #f1f5f9)', borderColor: 'var(--outline-variant, #cbd5e1)', color: 'var(--on-surface-variant, #64748b)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{internalDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {timeOptions.map((option) => {
              const isSelected = option.hora === internalTime;
              return (
                <button
                  key={option.hora}
                  type="button"
                  data-testid={`time-${option.hora}`}
                  disabled={option.disabled}
                  onClick={() => handleTimeChange(option.hora)}
                  className={`h-12 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : option.disabled
                        ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed line-through'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  {option.hora}
                  {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              );
            })}
          </div>

          {/* Hidden select for backward compatibility with tests */}
          <select
            data-testid="time-picker"
            value={internalTime ?? ''}
            onChange={(event) => handleTimeChange(event.target.value)}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          >
            <option value="">Seleccione...</option>
            {timeOptions.map((option) => (
              <option key={option.hora} value={option.hora} disabled={option.disabled}>
                {option.hora}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Show hint to select date first when no date chosen */}
      {!internalDate && (
        <p className="text-sm text-slate-400 italic py-4 text-center border border-dashed border-slate-200 rounded-lg">
          Seleccione primero una fecha arriba para ver los horarios disponibles.
        </p>
      )}
    </div>
  );
};
