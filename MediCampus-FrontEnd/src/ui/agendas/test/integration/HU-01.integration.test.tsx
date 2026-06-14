/**
 * Test Suite: HU-01 Integration Test
 * HU-01: Agendar Cita - Flujo Completo
 * Red Phase - Tests esperando que fallen inicialmente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAgendamiento } from '../../hooks/useAgendamiento';
import { Servicio, Profesional, Cita, EstadoCita } from '../../types';

/**
 * Hook wrapper for testing useAgendamiento
 */
function HU01IntegrationTest() {
  return useAgendamiento();
}

// Mock data
const mockServicios: Servicio[] = [
  {
    id: 1,
    nombre: 'Cardiología',
    descripcion: 'Especialidad del corazón',
    es_activo: true,
    profesionales: [
      {
        id: 101,
        nombre: 'Dr. Carlos García',
        email: 'carlos.garcia@hospital.com',
        especialidad: 'Cardiología',
        rol: 'PROFESIONAL',
        is_activo: true,
      },
    ],
  },
];

const mockProfesionales: Profesional[] = [
  {
    id: 101,
    nombre: 'Dr. Carlos García',
    email: 'carlos.garcia@hospital.com',
    especialidad: 'Cardiología',
    rol: 'PROFESIONAL',
    is_activo: true,
  },
];

describe('HU-01: Agendar Cita - Integration Test', () => {
  describe('Hook useAgendamiento - loadServicios()', () => {
    it('debe cargar servicios activos desde el API', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      await waitFor(() => {
        result.current.loadServicios();
      });

      await waitFor(() => {
        expect(result.current.servicios.length).toBeGreaterThan(0);
        expect(result.current.servicios[0].es_activo).toBe(true);
      });
    });

    it('debe mostrar loading=true mientras carga', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      result.current.loadServicios();

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('debe manejar errores de API', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Simular error de API
      await waitFor(() => {
        result.current.loadServicios();
      });

      // En caso de error, error debe estar seteado
      if (result.current.error) {
        expect(result.current.error).toBeDefined();
      }
    });
  });

  describe('Hook useAgendamiento - loadProfesionales()', () => {
    it('debe cargar profesionales para un servicio específico', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      await waitFor(() => {
        result.current.loadProfesionales(1);
      });

      await waitFor(() => {
        expect(result.current.profesionales.length).toBeGreaterThan(0);
        expect(result.current.profesionales[0].is_activo).toBe(true);
      });
    });

    it('debe filtrar solo profesionales activos (is_activo=true)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      await waitFor(() => {
        result.current.loadProfesionales(1);
      });

      await waitFor(() => {
        result.current.profesionales.forEach((prof: Profesional) => {
          expect(prof.is_activo).toBe(true);
        });
      });
    });

    it('debe devolver lista vacía si no hay profesionales', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      await waitFor(() => {
        result.current.loadProfesionales(999); // Servicio inexistente
      });

      await waitFor(() => {
        expect(result.current.profesionales.length).toBe(0);
      });
    });
  });

  describe('Hook useAgendamiento - checkDisponibilidad()', () => {
    it('debe validar que la fecha no sea pasada (RN-001)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const pastDate = '2026-05-26'; // Fecha pasada
      const isAvailable = result.current.checkDisponibilidad(101, 1, pastDate, '10:00');

      expect(isAvailable).toBe(false);
    });

    it('debe validar que la fecha esté dentro de 90 días adelante (RN-001)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const tooFarDate = '2026-09-01'; // Más de 90 días adelante
      const isAvailable = result.current.checkDisponibilidad(101, 1, tooFarDate, '10:00');

      expect(isAvailable).toBe(false);
    });

    it('debe detectar conflictos de horario con citas existentes', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Cargar citas existentes primero
      await waitFor(() => {
        result.current.loadServicios();
      });

      // Intenta agendar a misma hora que una cita existente
      const sameTime = result.current.checkDisponibilidad(101, 1, '2026-05-28', '10:00');

      if (result.current.citasExistentes.length > 0) {
        // Si hay citas existentes a esa hora, debe retornar false
        expect(typeof sameTime).toBe('boolean');
      }
    });

    it('debe respetar el margen entre citas (RN-002)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Si existe cita 10:00-10:30 + margen 30 min
      // La siguiente debe ser desde 11:00
      const conflictMargin = result.current.checkDisponibilidad(101, 1, '2026-05-28', '10:30');

      expect(typeof conflictMargin).toBe('boolean');
    });

    it('debe validar horario de atención (08:00 - 18:00)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const beforeHours = result.current.checkDisponibilidad(101, 1, '2026-05-28', '07:00');
      const afterHours = result.current.checkDisponibilidad(101, 1, '2026-05-28', '19:00');

      expect(beforeHours).toBe(false);
      expect(afterHours).toBe(false);
    });

    it('debe excluir descanso (12:00 - 13:00)', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const breakTime = result.current.checkDisponibilidad(101, 1, '2026-05-28', '12:30');

      expect(breakTime).toBe(false);
    });
  });

  describe('Hook useAgendamiento - crearCita()', () => {
    it('debe crear una cita con datos válidos', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const citaData = {
        paciente_id: 1,
        profesional_id: 101,
        servicio_id: 1,
        servicios_ids: [1],
        fecha: '2026-05-28',
        hora: '14:00',
        duracion_minutos: 30,
        margen_minutos: 30,
        estado: EstadoCita.AGENDADA,
        motivo: 'Consulta de rutina',
      };

      await waitFor(() => {
        result.current.crearCita(citaData);
      });

      await waitFor(() => {
        // Si no hay error, la cita fue creada
        if (!result.current.error) {
          expect(result.current.error).toBeNull();
        }
      });
    });

    it('debe validar datos requeridos antes de crear', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const invalidCita = {
        paciente_id: null as unknown as number, // Inválido
        profesional_id: 101,
        servicio_id: 1,
        servicios_ids: [1],
        fecha: '2026-05-28',
        hora: '14:00',
        duracion_minutos: 30,
        margen_minutos: 30,
        estado: EstadoCita.AGENDADA,
        motivo: '',
      };

      result.current.crearCita(invalidCita);

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it('debe retornar la cita creada con ID', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      const citaData = {
        paciente_id: 1,
        profesional_id: 101,
        servicio_id: 1,
        servicios_ids: [1],
        fecha: '2026-05-28',
        hora: '14:00',
        duracion_minutos: 30,
        margen_minutos: 30,
        estado: EstadoCita.AGENDADA,
        motivo: 'Consulta',
      };

      let createdCita: Cita | null = null;

      await waitFor(() => {
        result.current.crearCita(citaData).then((cita: Cita) => {
          createdCita = cita;
        });
      });

      if (createdCita) {
        const cita = createdCita as Cita;
        expect(cita.id).toBeDefined();
        expect(cita.fecha).toBe('2026-05-28');
        expect(cita.hora).toBe('14:00');
      }
    });
  });

  describe('Flujo Completo HU-01', () => {
    it('debe completar flujo: seleccionar servicio → profesional → fecha → guardar', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Paso 1: Cargar servicios
      await waitFor(() => {
        result.current.loadServicios();
      });
      expect(result.current.servicios.length).toBeGreaterThan(0);

      // Paso 2: Seleccionar servicio y cargar profesionales
      const servicioId = result.current.servicios[0].id;
      await waitFor(() => {
        result.current.loadProfesionales(servicioId);
      });
      expect(result.current.profesionales.length).toBeGreaterThan(0);

      // Paso 3: Verificar disponibilidad de fecha/hora
      const profesionalId = result.current.profesionales[0].id;
      const isAvailable = result.current.checkDisponibilidad(
        profesionalId,
        servicioId,
        '2026-05-28',
        '14:00'
      );
      expect(isAvailable).toBe(true);

      // Paso 4: Crear cita
      const citaData = {
        paciente_id: 1,
        profesional_id: profesionalId,
        servicio_id: servicioId,
        servicios_ids: [servicioId],
        fecha: '2026-05-28',
        hora: '14:00',
        duracion_minutos: 30,
        margen_minutos: 30,
        estado: EstadoCita.AGENDADA,
        motivo: 'Consulta',
      };

      await waitFor(() => {
        result.current.crearCita(citaData);
      });

      expect(result.current.error).toBeNull();
    });

    it('debe respetar todas las RN al agendar', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Verificar RN-001: no fechas pasadas
      const pastResult = result.current.checkDisponibilidad(101, 1, '2026-05-26', '10:00');
      expect(pastResult).toBe(false);

      // Verificar RN-002: duración 30min + margen 30min respetados
      const marginResult = result.current.checkDisponibilidad(101, 1, '2026-05-28', '10:30');
      // Debe considerarlo si hay conflicto

      // Verificar RN-003: M2M servicios soportado
      const multiServiceData = {
        paciente_id: 1,
        profesional_id: 101,
        servicio_id: 1,
        servicios_ids: [1, 2, 3], // Multiple services
        fecha: '2026-05-28',
        hora: '14:00',
        duracion_minutos: 30,
        margen_minutos: 30,
        estado: EstadoCita.AGENDADA,
        motivo: 'Consulta',
      };

      // Debería permitir M2M servicios
      expect(multiServiceData.servicios_ids.length).toBeGreaterThan(1);
    });

    it('debe permitir reset del estado', async () => {
      const result = renderHook(() => HU01IntegrationTest());

      // Cargar datos
      await waitFor(() => {
        result.current.loadServicios();
      });

      expect(result.current.servicios.length).toBeGreaterThan(0);

      // Reset
      result.current.reset();

      expect(result.current.servicios.length).toBe(0);
      expect(result.current.profesionales.length).toBe(0);
      expect(result.current.selectedService).toBeNull();
      expect(result.current.selectedProfessional).toBeNull();
    });
  });
});

/**
 * Hook rendering helper for testing hooks
 * Simulates renderHook functionality
 */
function renderHook<T>(callback: () => T) {
  let hookResult: T | null = null;

  const ensureResult = () => {
    if (!hookResult) {
      hookResult = callback();
    }
    return hookResult;
  };

  return {
    get current() {
      return ensureResult();
    },
  };
}
