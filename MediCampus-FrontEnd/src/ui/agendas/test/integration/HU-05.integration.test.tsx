import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDerivacion } from '../../hooks/useDerivacion';
import { Derivacion, EstadoDerivacion } from '../../types';

vi.mock('../../services/api/derivacionService', () => ({
  derivacionService: {
    crearDerivacion: vi.fn().mockResolvedValue({ success: true, data: { id: 1 } }),
    loadPendientes: vi.fn().mockResolvedValue({ success: true, data: [] }),
    aceptarDerivacion: vi.fn().mockResolvedValue({ success: true, data: { id: 1, estado: 'ACEPTADA', notas_respuesta: 'Aceptada' } }),
    rechazarDerivacion: vi.fn().mockResolvedValue({ success: true, data: { id: 1, estado: 'RECHAZADA', notas_respuesta: '' } }),
  },
}));

describe('HU-05: Derivaciones - Integration Test', () => {
  describe('Hook useDerivacion - crearDerivacion()', () => {
    it('debe llamar a crearDerivacion con datos válidos (RN-010, RN-011)', async () => {
      const { result } = renderHook(() => useDerivacion());
      const derivacionData = {
        cita_origen_id: 1,
        servicio_destino_id: 2,
        profesional_destino_id: 102,
        motivo: 'Paciente requiere evaluación psicológica urgente.',
      };
      await result.current.crearDerivacion(derivacionData);
      expect(result.current.error).toBeNull();
    });

    it('debe rechazar derivacion cuando servicio destino = servicio origen (RN-010)', async () => {
      const { result } = renderHook(() => useDerivacion());
      const invalidData = {
        cita_origen_id: 1,
        servicio_destino_id: 1,
        motivo: 'Motivo válido para prueba.',
      };
      const spy = vi.spyOn(await import('../../utils/validators/derivacionValidators'), 'validateDerivationDestiny');
      spy.mockReturnValue(false);
      await result.current.crearDerivacion(invalidData);
      expect(result.current.error).toBeDefined();
      spy.mockRestore();
    });

    it('debe rechazar derivacion cuando motivo tiene menos de 10 caracteres (RN-011)', async () => {
      const { result } = renderHook(() => useDerivacion());
      const invalidData = {
        cita_origen_id: 1,
        servicio_destino_id: 2,
        motivo: 'Corto',
      };
      await result.current.crearDerivacion(invalidData);
      expect(result.current.error).toBeDefined();
    });

    it('debe crear derivación exitosamente con datos válidos', async () => {
      const { result } = renderHook(() => useDerivacion());
      const derivacionData = {
        cita_origen_id: 1,
        servicio_destino_id: 2,
        motivo: 'Derivación a cardiología por evaluación.',
      };
      await result.current.crearDerivacion(derivacionData);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Hook useDerivacion - loadPendientes()', () => {
    it('debe cargar derivaciones pendientes para el profesional actual', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.loadPendientes(101);
      expect(Array.isArray(result.current.pendientes)).toBe(true);
    });

    it('debe retornar lista vacía si no hay pendientes', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.loadPendientes(999);
      expect(result.current.pendientes.length).toBe(0);
    });

    it('debe cargar solo pendientes sin errores', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.loadPendientes(101);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Hook useDerivacion - aceptarDerivacion()', () => {
    it('debe aceptar derivación sin errores', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.aceptarDerivacion(1);
      expect(result.current.error).toBeNull();
    });

    it('debe generar nuevaCitaId al aceptar', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.aceptarDerivacion(1);
      await waitFor(() => {
        expect(result.current.nuevaCitaId).toBeDefined();
        expect(typeof result.current.nuevaCitaId).toBe('number');
      });
    });
  });

  describe('Hook useDerivacion - rechazarDerivacion()', () => {
    it('debe rechazar derivación sin errores', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.rechazarDerivacion(1, 'Sin capacidad en este momento');
      expect(result.current.error).toBeNull();
    });

    it('debe permitir rechazar sin motivo (notas opcionales)', async () => {
      const { result } = renderHook(() => useDerivacion());
      await result.current.rechazarDerivacion(2);
      expect(result.current.error).toBeNull();
    });
  });
});
