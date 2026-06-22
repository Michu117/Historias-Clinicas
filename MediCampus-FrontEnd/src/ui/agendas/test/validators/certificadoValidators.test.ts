import { describe, it, expect } from 'vitest';
import { canGenerateCertificate } from '../../utils/validators/certificadoValidators';

describe('certificadoValidators - RN-009', () => {
  describe('canGenerateCertificate', () => {
    it('should return true when cita estado is ATENDIDA', () => {
      const cita = { id: 1, estado: 'ATENDIDA' } as any;
      expect(canGenerateCertificate(cita)).toBe(true);
    });

    it('should return false when cita estado is AGENDADA', () => {
      const cita = { id: 1, estado: 'AGENDADA' } as any;
      expect(canGenerateCertificate(cita)).toBe(false);
    });

    it('should return false when cita estado is CANCELADA', () => {
      const cita = { id: 1, estado: 'CANCELADA' } as any;
      expect(canGenerateCertificate(cita)).toBe(false);
    });

    it('should return false when cita estado is NO_ASISTIO', () => {
      const cita = { id: 1, estado: 'NO_ASISTIO' } as any;
      expect(canGenerateCertificate(cita)).toBe(false);
    });

    it('should return false for undefined or null estado', () => {
      expect(canGenerateCertificate({ id: 1, estado: undefined } as any)).toBe(false);
      expect(canGenerateCertificate({ id: 1, estado: null } as any)).toBe(false);
    });
  });
});
