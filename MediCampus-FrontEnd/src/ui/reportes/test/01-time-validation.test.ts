import { describe, it, expect } from 'vitest';
import { isDateValid, isRangeValid } from '../hooks/useTimePeriodValidation';

describe('TimePeriodValidator - RN-001 (Date Range Validation)', () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const futureDate = '2999-01-01';
  const validStart = '2024-01-01';
  const validEnd = '2024-12-31';

  it('rejects future dates (RN-001)', () => {
    expect(isDateValid(futureDate)).toBe(false);
  });

  it('accepts dates in past or today', () => {
    expect(isDateValid(validStart)).toBe(true);
    expect(isDateValid(todayStr)).toBe(true);
  });

  it('rejects range where start > end', () => {
    const res = isRangeValid('2024-12-31', '2024-01-01');
    expect(res.isValid).toBe(false);
  });

  it('accepts valid range where start <= end', () => {
    const res = isRangeValid(validStart, validEnd);
    expect(res.isValid).toBe(true);
  });

  it('returns error message for invalid range', () => {
    const res = isRangeValid('2024-12-31', '2024-01-01');
    expect(res.error).toBeDefined();
    expect(res.error).toContain('start');
  });
});

