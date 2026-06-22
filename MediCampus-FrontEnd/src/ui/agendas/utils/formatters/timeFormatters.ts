/**
 * Formateo de horas para UI
 * HH:mm formato 24h
 */

/**
 * Formatea un objeto Date a string HH:mm
 * @param date - Objeto Date
 * @returns Hora formateada (ej: "14:30")
 */
export const formatTimeToUI = (date: Date): string => {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return '(Hora inválida)';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return '(Hora inválida)';
  }
};

/**
 * Convierte string HH:mm a minutos desde medianoche
 * @param timeString - Tiempo como string (ej: "14:30")
 * @returns Minutos desde medianoche
 */
export const timeStringToMinutes = (timeString: string): number => {
  try {
    const parts = timeString.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato esperado: HH:mm');
    }

    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Valores fuera de rango');
    }

    return hours * 60 + minutes;
  } catch (error) {
    console.error('Error al convertir time string a minutos:', error);
    return 0;
  }
};

/**
 * Convierte minutos desde medianoche a string HH:mm
 * @param minutes - Minutos desde medianoche
 * @returns Tiempo formateado (ej: "14:30")
 */
export const minutesToTimeString = (minutes: number): string => {
  try {
    if (minutes < 0 || minutes >= 1440) {
      throw new Error('Minutos fuera de rango (0-1439)');
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error al convertir minutos a time string:', error);
    return '(Hora inválida)';
  }
};

/**
 * Suma minutos a una hora HH:mm
 * @param timeString - Hora inicial (ej: "14:30")
 * @param minutesToAdd - Minutos a sumar
 * @returns Nueva hora formateada (HH:mm), o error si excede 24h
 */
export const addMinutesToTime = (timeString: string, minutesToAdd: number): string => {
  try {
    const minutes = timeStringToMinutes(timeString);
    const newMinutes = minutes + minutesToAdd;

    if (newMinutes < 0 || newMinutes >= 1440) {
      throw new Error('La hora resultante excede los límites del día');
    }

    return minutesToTimeString(newMinutes);
  } catch (error) {
    console.error('Error al sumar minutos a hora:', error);
    return '(Hora inválida)';
  }
};

/**
 * Calcula diferencia en minutos entre dos tiempos HH:mm
 * @param time1 - Primera hora (ej: "14:30")
 * @param time2 - Segunda hora (ej: "15:00")
 * @returns Diferencia en minutos (positivo si time1 > time2)
 */
export const getMinutesDifference = (time1: string, time2: string): number => {
  try {
    const minutes1 = timeStringToMinutes(time1);
    const minutes2 = timeStringToMinutes(time2);

    return minutes1 - minutes2;
  } catch (error) {
    console.error('Error al calcular diferencia de tiempos:', error);
    return 0;
  }
};
