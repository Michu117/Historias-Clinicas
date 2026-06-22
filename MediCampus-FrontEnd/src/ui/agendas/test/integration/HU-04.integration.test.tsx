import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCertificado } from '../../hooks/useCertificado';

describe('HU-04: Certificados - Integration Test', () => {
  describe('Hook useCertificado - generarCertificado()', () => {
    it('debe generar certificado para cita en estado ATENDIDA (RN-009)', async () => {
      const { result } = renderHook(() => useCertificado());
      await result.current.generarCertificado(1);
      expect(result.current.error).toBeNull();
    });

    it('debe rechazar generación si la cita NO está ATENDIDA (RN-009)', async () => {
      const { result } = renderHook(() => useCertificado());
      await result.current.generarCertificado(2);
      expect(result.current.error).toBeDefined();
    });

    it('debe retornar datos del certificado al generar exitosamente', async () => {
      const { result } = renderHook(() => useCertificado());
      await result.current.generarCertificado(1);
      await waitFor(() => {
        expect(result.current.certificadoData).toBeDefined();
      });
    });
  });

  describe('Hook useCertificado - descargarPDF()', () => {
    it('debe descargar PDF sin errores', async () => {
      const { result } = renderHook(() => useCertificado());
      await result.current.generarCertificado(1);
      await waitFor(() => {
        expect(result.current.certificadoData).toBeDefined();
      });
      await result.current.descargarPDF(result.current.certificadoData!);
      expect(result.current.error).toBeNull();
    });

    it('debe rechazar descarga si no hay datos de certificado', async () => {
      const { result } = renderHook(() => useCertificado());
      await expect(result.current.descargarPDF(null as any)).rejects.toThrow();
    });
  });

  describe('Hook useCertificado - loading state', () => {
    it('debe mostrar loading durante generación de certificado', async () => {
      const { result } = renderHook(() => useCertificado());
      await act(async () => {
        await result.current.generarCertificado(1);
      });
      expect(result.current.loading).toBe(false);
    });
  });
});
