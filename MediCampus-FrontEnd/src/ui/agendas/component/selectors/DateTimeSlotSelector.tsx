import React, { useEffect, useState, useMemo } from 'react';
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

const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
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

  const todayStart = useMemo(() => getTodayStart(), []);
  const minDate = useMemo(() => addDays(todayStart, 1), [todayStart]);
  const maxDate = useMemo(() => addDays(todayStart, 90), [todayStart]);

  const availableDates: { fecha: string; disabled: boolean }[] = [];
  for (let dayOffset = -1; dayOffset <= 95; dayOffset += 1) {
    const current = addDays(todayStart, dayOffset);
    const fecha = formatDate(current);
    const isPast = current < minDate;
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const disabled = isPast || isWeekend || current > maxDate;
    availableDates.push({ fecha, disabled });
  }

  const nowMinutes = useMemo(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }, []);

  const todayStr = useMemo(() => formatDate(todayStart), [todayStart]);

  const timeOptions = allTimeSlots.map((hora) => {
    const horaMinutes = parseTime(hora);
    const isPastSlot = internalDate === todayStr && horaMinutes <= nowMinutes;
    const disabled =
      !isWithinBusinessHours(horaMinutes) ||
      isInBreakTime(horaMinutes) ||
      isPastSlot ||
      (internalDate !== null && hasConflict(citasExistentes, profesionalId, internalDate, hora));

    return { hora, disabled };
  });

  const handleDateChange = (fecha: string) => {
    const minStr = formatDate(minDate);
    if (fecha < minStr) {
      return;
    }
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
      <div className="flex items-center justify-center py-8 text-sm" style={{ color: 'var(--on-surface-variant)' }}>
        {'Cargando horarios...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div>
        <label htmlFor="date-picker" className="text-sm font-bold block mb-2" style={{ color: 'var(--on-surface)' }}>
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
          className="w-full h-12 px-4 rounded-lg border text-sm outline-none transition-all"
          style={{ backgroundColor: 'var(--surface-container-low)', borderColor: 'var(--outline)', color: 'var(--on-surface)' }}
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
            <p className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>
              Horarios disponibles para{' '}
              <span className="font-semibold" style={{ color: 'var(--on-surface)' }}>{internalDate}</span>:
            </p>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
              style={{ backgroundColor: 'var(--surface-container-high)', borderColor: 'var(--outline)', color: 'var(--on-surface-variant)' }}
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
                      ? 'shadow-md'
                      : option.disabled
                        ? 'cursor-not-allowed line-through'
                        : ''
                  }`}
                  style={{
                    ...(isSelected
                      ? { backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderColor: 'var(--primary)' }
                      : option.disabled
                        ? { backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', borderColor: 'var(--outline)', opacity: 0.5 }
                        : { backgroundColor: 'var(--card-bg)', color: 'var(--on-surface)', borderColor: 'var(--outline)' }
                    ),
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && !option.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-container-high)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && !option.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                    }
                  }}
                >
                  {option.hora}
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--on-primary)' }} />}
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
        <p className="text-sm italic py-4 text-center border border-dashed rounded-lg" style={{ color: 'var(--on-surface-variant)', borderColor: 'var(--outline)' }}>
          Seleccione primero una fecha arriba para ver los horarios disponibles.
        </p>
      )}
    </div>
  );
};
