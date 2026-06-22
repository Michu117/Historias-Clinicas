import { validateObservaciones, isConsultaEditable } from '../../utils/validators/consultaValidators';

describe('consultaValidators', () => {
  // RN-007: Observaciones obligatorias, min 10 caracteres
  it('should return true for valid observations (more than 10 characters)', () => {
    expect(validateObservaciones('This is a valid observation with more than ten characters.')).toBe(true);
  });

  it('should return false for observations with less than 10 characters', () => {
    expect(validateObservaciones('Short')).toBe(false);
  });

  it('should return false for empty observations', () => {
    expect(validateObservaciones('')).toBe(false);
  });

  it('should return false for observations with only spaces', () => {
    expect(validateObservaciones('          ')).toBe(false);
  });

  // RN-008: Detectar consulta ya guardada (inmutable)
  it('should return false if the consultation has been saved (fecha_creacion exists)', () => {
    const consulta = { id: 1, fecha_creacion: '2026-01-01T10:00:00Z' };
    expect(isConsultaEditable(consulta as any)).toBe(false);
  });

  it('should return true if the consultation has not been saved (no fecha_creacion)', () => {
    const consulta = { id: 1 };
    expect(isConsultaEditable(consulta as any)).toBe(true);
  });

  it('should return true if fecha_creacion is null', () => {
    const consulta = { id: 1, fecha_creacion: null };
    expect(isConsultaEditable(consulta as any)).toBe(true);
  });
});