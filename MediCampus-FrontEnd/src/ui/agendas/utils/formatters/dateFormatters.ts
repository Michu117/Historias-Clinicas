/**
 * Formateo de fechas para UI
 * ISO 8601 ↔ Formato legible (dd/mm/yyyy)
 */

/**
 * Convierte fecha ISO 8601 a formato DD/MM/YYYY
 * @param isoDate - Fecha en formato ISO (ej: "2026-05-27T10:30:00Z")
 * @returns Fecha formateada (ej: "27/05/2026")
 */
export const formatDateToUI = (isoDate: string | Date): string => {
  try {
    const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;

    if (isNaN(date.getTime())) {
      return '(Fecha inválida)';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha a UI:', error);
    return '(Fecha inválida)';
  }
};

/**
 * Convierte fecha DD/MM/YYYY o Date a ISO 8601
 * @param dateInput - Fecha como string (DD/MM/YYYY) o Date object
 * @returns Fecha en formato ISO 8601 (ej: "2026-05-27T00:00:00.000Z")
 */
export const formatDateToISO = (dateInput: string | Date): string => {
  try {
    let date: Date;

    if (typeof dateInput === 'string') {
      // Parsear DD/MM/YYYY
      const parts = dateInput.split('/');
      if (parts.length !== 3) {
        throw new Error('Formato esperado: DD/MM/YYYY');
      }
      const [day, month, year] = parts.map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) {
      throw new Error('Fecha inválida');
    }

    return date.toISOString();
  } catch (error) {
    console.error('Error al convertir fecha a ISO:', error);
    throw new Error('No se pudo convertir la fecha a ISO 8601');
  }
};

/**
 * Obtiene la fecha actual en formato ISO 8601
 * @returns Fecha actual en ISO
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Suma días a una fecha
 * @param date - Fecha inicial (ISO o Date)
 * @param days - Número de días a sumar (puede ser negativo)
 * @returns Nueva fecha en formato ISO
 */
export const addDaysToDate = (date: string | Date, days: number): string => {
  try {
    const baseDate = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(baseDate.getTime())) {
      throw new Error('Fecha inválida');
    }

    baseDate.setDate(baseDate.getDate() + days);
    return baseDate.toISOString();
  } catch (error) {
    console.error('Error al sumar días a fecha:', error);
    throw new Error('No se pudo sumar días a la fecha');
  }
};

/**
 * Obtiene la diferencia en días entre dos fechas
 * @param date1 - Primera fecha
 * @param date2 - Segunda fecha
 * @returns Número de días (positivo si date1 > date2)
 */
export const getDaysDifference = (date1: string | Date, date2: string | Date): number => {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      throw new Error('Fecha inválida');
    }

    const diffMs = d1.getTime() - d2.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular diferencia de días:', error);
    return 0;
  }
};
