import React, { useEffect, useState } from 'react';
import { Cita } from '../../types';
import { messages } from '../../utils/constants/messages';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';

interface DateTimeSlotSelectorProps {
  profesionalId: number;
  servicioId: number;
  citasExistentes: Cita[];
  selectedDate: string | null;
  selectedTime: string | null;
  onSelect: (data: { fecha: string; hora: string }) => void;
  isLoading: boolean;
}

const REFERENCE_DATE = new Date('2026-05-27T00:00:00Z');

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes) ? NaN : hours * 60 + minutes;
};

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
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
    const existingEnd = existingStart + cita.duracion_minutos + cita.margen_minutos;
    const requestedEnd = start + 30 + 30;

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

  const minDate = addDays(REFERENCE_DATE, 1);
  const maxDate = addDays(REFERENCE_DATE, 90);
  const availableDates: { fecha: string; disabled: boolean }[] = [];

  for (let dayOffset = -1; dayOffset <= 95; dayOffset += 1) {
    const current = addDays(REFERENCE_DATE, dayOffset);
    const fecha = formatDate(current);
    const disabled = current < minDate || current > maxDate;
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
    onSelect({ fecha, hora: internalTime ?? '' });
  };

  const handleTimeChange = (hora: string) => {
    setInternalTime(hora);
    onSelect({ fecha: internalDate ?? '', hora });
  };

  return (
    <div>
      {isLoading ? (
        <div>{'Cargando horarios'}</div>
      ) : (
        <>
          <div>
            <label htmlFor="date-picker">{messages.placeholders.selectDate}</label>
            <Input
              id="date-picker"
              data-testid="date-picker"
              aria-label={messages.placeholders.selectDate}
              type="date"
              value={internalDate ?? ''}
              min={formatDate(minDate)}
              max={formatDate(maxDate)}
              onChange={(event) => handleDateChange(event.target.value)}
            />
          </div>

          <div>
            {availableDates.map((date) => (
              <button
                key={date.fecha}
                type="button"
                data-testid={`date-${date.fecha}`}
                disabled={date.disabled}
                onClick={() => handleDateChange(date.fecha)}
                style={{ display: 'none' }}
              >
                {date.fecha}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="time-picker">{messages.placeholders.selectTime}</label>
            <select
              id="time-picker"
              data-testid="time-picker"
              value={internalTime ?? ''}
              onChange={(event) => handleTimeChange(event.target.value)}
              disabled={isLoading}
            >
              <option value="">Seleccione...</option>
              {timeOptions.map((option) => (
                <option key={option.hora} data-testid={`time-${option.hora}`} value={option.hora} disabled={option.disabled}>
                  {option.hora}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};
