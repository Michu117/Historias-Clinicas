/**
 * useTimePeriodValidation.ts
 * Custom hook for date and time period validation (RN-001)
 */

export interface RangeValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a date is not in the future
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
 * Validates date range: start <= end and both are not future
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

