import { renderHook, act, waitFor } from '@testing-library/react';
import { useConsulta } from '../../hooks/useConsulta';
import { Cita, EstadoCita } from '../../types';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 1, rol: 'profesional' } })),
}));

vi.mock('../../services/api/consultaService', () => ({
  consultaService: {
    obtenerConsulta: vi.fn(),
    crearConsulta: vi.fn(),
    guardarConsulta: vi.fn(),
  },
}));

import { consultaService } from '../../services/api/consultaService';

describe('HU-03: Registro de Datos en Consulta Digital (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call obtenerConsulta when component mounts with citaId', async () => {
    const mockCitaId = 123;
    const mockConsulta = { id: 1, cita: mockCitaId, observaciones: 'Initial consult' };
    consultaService.obtenerConsulta.mockResolvedValueOnce({ data: mockConsulta });

    const { result } = renderHook(() => useConsulta(mockCitaId));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(consultaService.obtenerConsulta).toHaveBeenCalledWith(mockCitaId);
    expect(result.current.consulta).toEqual(mockConsulta);
  });

  it('should call crearConsulta and update cita status to ATENDIDA', async () => {
    const mockCitaId = 123;
    const mockTipoServicio = 'medica';
    const mockConsultaData = {
      historia_clinica_id: 1,
      anamnesis: 'Paciente con fiebre',
      tratamiento: 'Paracetamol',
      diagnostico: 'Gripe',
      observaciones: 'Consulta inicial y tratamiento recetado.',
      signos_vitales: {
        peso_kg: 70,
        temperatura: 38.5,
        presion_arterial: '120/80',
        frecuencia_cardiaca: 80,
      },
    };
    const mockCreatedConsulta = { id: 1, ...mockConsultaData, cita: mockCitaId };

    consultaService.crearConsulta.mockResolvedValueOnce({ data: mockCreatedConsulta });

    const { result } = renderHook(() => useConsulta(mockCitaId));

    await act(async () => {
      await result.current.crearConsulta(mockCitaId, mockTipoServicio, mockConsultaData as any);
    });

    await waitFor(() => expect(consultaService.crearConsulta).toHaveBeenCalledWith(mockCitaId, mockTipoServicio, mockConsultaData));
    await waitFor(() => expect(result.current.consulta).toEqual(mockCreatedConsulta));
    await waitFor(() => expect(result.current.cita?.estado).toBe(EstadoCita.ATENDIDA));
  });

  it('should handle errors during consulta creation', async () => {
    const mockCitaId = 123;
    const mockTipoServicio = 'medica';
    const mockConsultaData = { historia_clinica_id: 1, observaciones: 'Valid observaciones' };
    const errorMessage = 'Observaciones must be at least 10 characters.';

    consultaService.obtenerConsulta.mockResolvedValue({ data: null });
    consultaService.crearConsulta.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useConsulta(mockCitaId));

    await act(async () => {
      await result.current.crearConsulta(mockCitaId, mockTipoServicio, mockConsultaData as any);
    });

    await waitFor(() => expect(result.current.error).toBe(errorMessage));
    await waitFor(() => expect(result.current.consulta).toBeNull());
  });

  it('should validate observations length before creating consulta', async () => {
    const mockCitaId = 123;
    const mockTipoServicio = 'medica';
    const mockConsultaData = { historia_clinica_id: 1, observaciones: 'short' };

    consultaService.obtenerConsulta.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useConsulta(mockCitaId));

    await act(async () => {
      await result.current.crearConsulta(mockCitaId, mockTipoServicio, mockConsultaData as any);
    });

    await waitFor(() => expect(consultaService.crearConsulta).not.toHaveBeenCalled());
    await waitFor(() => expect(result.current.error).toBe('Las observaciones deben tener al menos 10 caracteres.'));
  });

  it('should not allow saving an already saved consultation', async () => {
    const mockCitaId = 123;
    const mockSavedConsulta = { id: 1, fecha_creacion: '2026-01-01T10:00:00Z', observaciones: 'Valid and saved.' };

    consultaService.obtenerConsulta.mockResolvedValueOnce({ data: mockSavedConsulta });

    const { result } = renderHook(() => useConsulta(mockCitaId));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.guardarConsulta(1, { observaciones: 'Attempt to edit' } as any);
    });

    await waitFor(() => expect(consultaService.guardarConsulta).not.toHaveBeenCalled());
    await waitFor(() => expect(result.current.error).toBe('La consulta no puede ser editada una vez guardada.'));
  });

  it('should prevent creating/saving if the current user is not the assigned professional (mocked)', async () => {
    const mockCitaId = 123;
    const mockTipoServicio = 'medica';
    const mockConsultaData = { historia_clinica_id: 1, observaciones: 'Valid observations.' };

    consultaService.obtenerConsulta.mockResolvedValue({ data: null });
    consultaService.crearConsulta.mockImplementationOnce(() => {
      throw new Error('El usuario actual no es el profesional asignado a esta cita.');
    });

    const { result } = renderHook(() => useConsulta(mockCitaId));

    await act(async () => {
      await result.current.crearConsulta(mockCitaId, mockTipoServicio, mockConsultaData as any);
    });

    await waitFor(() => expect(result.current.error).toBe('El usuario actual no es el profesional asignado a esta cita.'));
  });
});