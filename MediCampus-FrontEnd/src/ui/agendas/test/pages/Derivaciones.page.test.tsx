import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Derivaciones } from '../../component/pages/Derivaciones';
import { useDerivacion } from '../../hooks/useDerivacion';
import { useAuth } from '../../hooks/useAuth';
import { EstadoDerivacion } from '../../types';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 101, rol: 'PROFESIONAL' },
    isAuthenticated: true,
  })),
}));

vi.mock('../../hooks/useDerivacion', () => ({
  useDerivacion: vi.fn(() => ({
    pendientes: [],
    loadPendientes: vi.fn(),
    aceptarDerivacion: vi.fn(),
    rechazarDerivacion: vi.fn(),
    crearDerivacion: vi.fn(),
    nuevaCitaId: null,
    error: null,
    loading: false,
  })),
}));

describe('Derivaciones Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protección de ruta', () => {
    it('debe validar que el usuario autenticado tiene rol PROFESIONAL', () => {
      render(<Derivaciones />);
      expect(screen.getByRole('heading', { name: /derivaciones pendientes/i })).toBeInTheDocument();
    });

    it('debe redirigir si el usuario no es profesional', () => {
      vi.mocked(useAuth).mockReturnValueOnce({
        user: { id: 1, rol: 'PACIENTE' },
        isAuthenticated: true,
      });
      render(<Derivaciones />);
      expect(screen.queryByText(/derivaciones pendientes/i)).not.toBeInTheDocument();
    });
  });

  describe('Renderizado de bandeja', () => {
    it('debe cargar y mostrar derivaciones pendientes del profesional actual', () => {
      const mockPendientes = [
        {
          id: 1,
          cita_origen_id: 10,
          profesional_origen_id: 101,
          servicio_destino_id: 2,
          motivo: 'Paciente requiere evaluación cardiológica.',
          estado: EstadoDerivacion.PENDIENTE,
          fecha_creacion: '2026-06-14T10:00:00Z',
        },
      ];
      vi.mocked(useDerivacion).mockReturnValueOnce({
        pendientes: mockPendientes,
        loadPendientes: vi.fn(),
        aceptarDerivacion: vi.fn(),
        rechazarDerivacion: vi.fn(),
        error: null,
        loading: false,
      });

      render(<Derivaciones />);
      expect(screen.getByText(/derivaciones pendientes/i)).toBeInTheDocument();
    });

    it('debe mostrar mensaje de lista vacía cuando no hay derivaciones', () => {
      render(<Derivaciones />);
      expect(screen.getByText(/no hay derivaciones pendientes/i)).toBeInTheDocument();
    });

    it('debe mostrar spinner mientras carga derivaciones', () => {
      vi.mocked(useDerivacion).mockReturnValueOnce({
        pendientes: [],
        loadPendientes: vi.fn(),
        aceptarDerivacion: vi.fn(),
        rechazarDerivacion: vi.fn(),
        error: null,
        loading: true,
      });

      render(<Derivaciones />);
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  describe('Acciones en derivaciones', () => {
    it('debe ejecutar aceptarDerivacion al hacer clic en Aceptar', async () => {
      const mockAceptar = vi.fn();
      const mockPendientes = [
        {
          id: 1,
          cita_origen_id: 10,
          profesional_origen_id: 101,
          servicio_destino_id: 2,
          motivo: 'Paciente requiere evaluación cardiológica.',
          estado: EstadoDerivacion.PENDIENTE,
          fecha_creacion: '2026-06-14T10:00:00Z',
        },
      ];
      vi.mocked(useDerivacion).mockReturnValueOnce({
        pendientes: mockPendientes,
        loadPendientes: vi.fn(),
        aceptarDerivacion: mockAceptar,
        rechazarDerivacion: vi.fn(),
        error: null,
        loading: false,
      });

      render(<Derivaciones />);
      const acceptButton = screen.getByRole('button', { name: /aceptar/i });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockAceptar).toHaveBeenCalledWith(1);
      });
    });

    it('debe ejecutar rechazarDerivacion al hacer clic en Rechazar', async () => {
      const mockRechazar = vi.fn();
      const mockPendientes = [
        {
          id: 1,
          cita_origen_id: 10,
          profesional_origen_id: 101,
          servicio_destino_id: 2,
          motivo: 'Paciente requiere evaluación cardiológica.',
          estado: EstadoDerivacion.PENDIENTE,
          fecha_creacion: '2026-06-14T10:00:00Z',
        },
      ];
      vi.mocked(useDerivacion).mockReturnValueOnce({
        pendientes: mockPendientes,
        loadPendientes: vi.fn(),
        aceptarDerivacion: vi.fn(),
        rechazarDerivacion: mockRechazar,
        error: null,
        loading: false,
      });

      render(<Derivaciones />);
      const rejectButton = screen.getByRole('button', { name: /rechazar/i });
      fireEvent.click(rejectButton);

      await waitFor(() => {
        expect(mockRechazar).toHaveBeenCalledWith(1);
      });
    });

    it('debe mostrar notificación de éxito al aceptar una derivación', async () => {
      const mockPendientes = [
        {
          id: 1,
          cita_origen_id: 10,
          profesional_origen_id: 101,
          servicio_destino_id: 2,
          motivo: 'Paciente requiere evaluación cardiológica.',
          estado: EstadoDerivacion.PENDIENTE,
          fecha_creacion: '2026-06-14T10:00:00Z',
        },
      ];
      vi.mocked(useDerivacion).mockReturnValueOnce({
        pendientes: mockPendientes,
        loadPendientes: vi.fn(),
        aceptarDerivacion: vi.fn().mockResolvedValue({ success: true }),
        rechazarDerivacion: vi.fn(),
        error: null,
        loading: false,
      });

      render(<Derivaciones />);
      const acceptButton = screen.getByRole('button', { name: /aceptar/i });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByText(/derivación aceptada/i)).toBeInTheDocument();
      });
    });
  });
});
