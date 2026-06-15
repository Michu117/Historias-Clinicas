/**
 * ReportesValidators.ts
 * Business logic for date validation (RN-001) and report data validation
 */

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RangeValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a date is not in the future (RN-001)
 */
export function isDateValid(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  } catch {
    return false;
  }
}

/**
 * Validates date range: start <= end and both are not future (RN-001)
 */
export function isRangeValid(startStr: string, endStr: string): RangeValidationResult {
  if (!startStr || !endStr) {
    return { isValid: false, error: 'Both dates required' };
  }

  if (!isDateValid(startStr)) {
    return { isValid: false, error: 'Start date is invalid or in future' };
  }

  if (!isDateValid(endStr)) {
    return { isValid: false, error: 'End date is invalid or in future' };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (start > end) {
    return { isValid: false, error: 'Start date must be <= end date' };
  }

  return { isValid: true };
}

/**
 * Validates report filter object
 */
export function validateReportFilter(filter: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!filter.fecha_inicio || !filter.fecha_fin) {
    errors.push('Date range required');
  } else {
    const rangeValidation = isRangeValid(filter.fecha_inicio, filter.fecha_fin);
    if (!rangeValidation.isValid) {
      errors.push(rangeValidation.error || 'Invalid date range');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats a number as a currency/metric value
 */
export function formatMetricValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  if (typeof value !== 'number') return '-';
  return value.toLocaleString('es-AR');
}

/**
 * Calculates percentage change
 */
export function calculateDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

