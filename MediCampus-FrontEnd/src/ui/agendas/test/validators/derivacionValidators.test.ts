import { validateDerivationDestiny, validateMotivo } from '../../utils/validators/derivacionValidators';

describe('derivacionValidators', () => {
  // RN-010: Servicio destino ≠ servicio actual
  describe('validateDerivationDestiny', () => {
    it('should return true when destino is different from origen', () => {
      expect(validateDerivationDestiny(1, 2)).toBe(true);
      expect(validateDerivationDestiny(5, 10)).toBe(true);
    });

    it('should return false when destino equals origen', () => {
      expect(validateDerivationDestiny(1, 1)).toBe(false);
      expect(validateDerivationDestiny(3, 3)).toBe(false);
    });

    it('should handle string inputs', () => {
      expect(validateDerivationDestiny('1', '2')).toBe(true);
      expect(validateDerivationDestiny('3', '3')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateDerivationDestiny(0, 1)).toBe(true);
      expect(validateDerivationDestiny(-1, 1)).toBe(true);
    });
  });

  // RN-011: Motivo obligatorio, min 10 caracteres
  describe('validateMotivo', () => {
    it('should return true for motivo with 10+ characters', () => {
      expect(validateMotivo('Derivación por especialidad')).toBe(true);
      expect(validateMotivo('1234567890')).toBe(true);
      expect(validateMotivo('Paciente requiere evaluación psicológica')).toBe(true);
    });

    it('should return false for motivo with less than 10 characters', () => {
      expect(validateMotivo('Corto')).toBe(false);
      expect(validateMotivo('123456789')).toBe(false);
      expect(validateMotivo('')).toBe(false);
      expect(validateMotivo('   ')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validateMotivo('  Motivo válido  ')).toBe(true);
      expect(validateMotivo('  corto  ')).toBe(false);
    });
  });
});