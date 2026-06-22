import {
  isDatePast,
  hasConflict,
  hasCitaSameDayService,
  isServiceActive,
  validateUserRole,
} from '../../utils/validators/citaValidators';
import { EstadoCita } from '../../types';

describe('citaValidators - RN-001 isDatePast', () => {
  it('debe retornar true para una fecha pasada', () => {
    expect(isDatePast('2024-01-01')).toBe(true);
  });

  it('debe retornar false para la fecha actual', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isDatePast(today)).toBe(false);
  });

  it('debe retornar false para una fecha futura', () => {
    expect(isDatePast('2099-12-31')).toBe(false);
  });

  it('debe retornar true para un valor de fecha inválido', () => {
    expect(isDatePast('fecha-invalida')).toBe(true);
  });

  it('debe retornar false para una fecha válida en el mismo formato ISO', () => {
    expect(isDatePast('2026-12-01')).toBe(false);
  });
});

describe('citaValidators - RN-002 hasConflict', () => {
  const citasExistentes = [
    {
      id: 1,
      paciente_id: 1,
      profesional_id: 101,
      servicio_id: 1,
      servicios_ids: [1],
      fecha: '2026-05-28',
      hora: '10:00',
      duracion_minutos: 30,
      margen_minutos: 30,
      estado: EstadoCita.AGENDADA,
      motivo: 'Consulta inicial',
      created_at: '2026-05-01T10:00:00Z',
      updated_at: '2026-05-01T10:00:00Z',
    },
  ];

  it('debe detectar conflicto cuando la cita solicita la misma hora', () => {
    expect(hasConflict(101, '2026-05-28', '10:00', citasExistentes)).toBe(true);
  });

  it('debe detectar conflicto cuando la cita inicia dentro de la duración existente', () => {
    expect(hasConflict(101, '2026-05-28', '10:15', citasExistentes)).toBe(true);
  });

  it('debe detectar conflicto cuando la cita inicia durante el margen existente', () => {
    expect(hasConflict(101, '2026-05-28', '10:30', citasExistentes)).toBe(true);
  });

  it('debe detectar conflicto cuando la cita inicia antes y se superpone', () => {
    expect(hasConflict(101, '2026-05-28', '09:45', citasExistentes)).toBe(true);
  });

  it('no debe detectar conflicto cuando la cita inicia al final del margen reservado', () => {
    expect(hasConflict(101, '2026-05-28', '11:00', citasExistentes)).toBe(false);
  });

  it('no debe detectar conflicto si es otro profesional', () => {
    expect(hasConflict(102, '2026-05-28', '10:00', citasExistentes)).toBe(false);
  });

  it('no debe detectar conflicto si es otra fecha', () => {
    expect(hasConflict(101, '2026-05-29', '10:00', citasExistentes)).toBe(false);
  });

  it('debe detectar conflicto si existe cualquier cita superpuesta en múltiples registros', () => {
    const existentes = [...citasExistentes, {
      ...citasExistentes[0],
      id: 2,
      hora: '09:30',
    }];
    expect(hasConflict(101, '2026-05-28', '09:45', existentes)).toBe(true);
  });

  it('no debe detectar conflicto cuando no hay citas existentes', () => {
    expect(hasConflict(101, '2026-05-28', '10:00', [])).toBe(false);
  });

  it('debe detectar conflicto para citas que terminan justo antes del margen completo', () => {
    expect(hasConflict(101, '2026-05-28', '10:45', citasExistentes)).toBe(true);
  });
});

describe('citaValidators - RN-003 hasCitaSameDayService', () => {
  const citasExistentes = [
    {
      id: 1,
      paciente_id: 1,
      profesional_id: 101,
      servicio_id: 1,
      servicios_ids: [1, 2],
      fecha: '2026-05-28',
      hora: '10:00',
      duracion_minutos: 30,
      margen_minutos: 30,
      estado: EstadoCita.AGENDADA,
      motivo: 'Consulta múltiple',
      created_at: '2026-05-01T10:00:00Z',
      updated_at: '2026-05-01T10:00:00Z',
    },
  ];

  it('debe retornar true si el usuario ya tiene una cita con el mismo servicio en el mismo día', () => {
    expect(hasCitaSameDayService(1, 1, '2026-05-28', citasExistentes)).toBe(true);
  });

  it('debe retornar false si el servicio es diferente en la misma fecha', () => {
    expect(hasCitaSameDayService(1, 3, '2026-05-28', citasExistentes)).toBe(false);
  });

  it('debe retornar true si el servicio solicitado existe en servicios_ids M2M', () => {
    expect(hasCitaSameDayService(1, 2, '2026-05-28', citasExistentes)).toBe(true);
  });

  it('debe retornar false si es otra fecha', () => {
    expect(hasCitaSameDayService(1, 1, '2026-05-29', citasExistentes)).toBe(false);
  });

  it('debe retornar false si es otro paciente', () => {
    expect(hasCitaSameDayService(2, 1, '2026-05-28', citasExistentes)).toBe(false);
  });

  it('debe retornar true si servicios_ids contiene el servicio y no es servicio_id principal', () => {
    expect(hasCitaSameDayService(1, 2, '2026-05-28', citasExistentes)).toBe(true);
  });

  it('debe retornar false si no hay citas existentes', () => {
    expect(hasCitaSameDayService(1, 1, '2026-05-28', [])).toBe(false);
  });

  it('debe retornar true para una cita existente que lista el servicio en servicios_ids', () => {
    expect(hasCitaSameDayService(1, 1, '2026-05-28', citasExistentes)).toBe(true);
  });

  it('debe retornar false si el servicio solicitado no está en ninguna cita M2M existente', () => {
    expect(hasCitaSameDayService(1, 4, '2026-05-28', citasExistentes)).toBe(false);
  });
});

describe('citaValidators - RN-004 isServiceActive', () => {
  it('debe retornar true para servicios activos', () => {
    expect(isServiceActive({ id: 1, nombre: 'Cardio', es_activo: true })).toBe(true);
  });

  it('debe retornar false para servicios inactivos', () => {
    expect(isServiceActive({ id: 1, nombre: 'Cardio', es_activo: false })).toBe(false);
  });

  it('debe retornar false para servicios con es_activo undefined', () => {
    expect(isServiceActive({ id: 1, nombre: 'Cardio' } as any)).toBe(false);
  });

  it('debe retornar false para servicios con es_activo como string', () => {
    expect(isServiceActive({ id: 1, nombre: 'Cardio', es_activo: 'true' as any })).toBe(false);
  });

  it('debe retornar true solo cuando el valor es estrictamente true', () => {
    expect(isServiceActive({ id: 1, nombre: 'Cardio', es_activo: true })).toBe(true);
  });
});

describe('citaValidators - RN-005 validateUserRole', () => {
  const toBase64Url = (str: string) =>
    btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const buildJwt = (payload: Record<string, unknown>) => {
    const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = toBase64Url(JSON.stringify(payload));
    return `${header}.${body}.`;
  };

  it('debe retornar true cuando el rol coincide exactamente', () => {
    const token = buildJwt({ role: 'PROFESIONAL' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(true);
  });

  it('debe retornar false cuando el rol no coincide', () => {
    const token = buildJwt({ role: 'ADMIN' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar false cuando el rol difiere en mayúsculas/minúsculas', () => {
    const token = buildJwt({ role: 'profesional' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar false cuando el JWT no contiene role', () => {
    const token = buildJwt({ sub: 1 });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar false para un JWT inválido', () => {
    expect(validateUserRole('token-invalido', 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar false para token vacío', () => {
    expect(validateUserRole('', 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar true para un rol válido incluso con otros campos adicionales', () => {
    const token = buildJwt({ role: 'PROFESIONAL', email: 'carlos@hospital.com' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(true);
  });

  it('debe retornar false si el role es un número en el payload', () => {
    const token = buildJwt({ role: 101 });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar false si el role es un string con espacios adicionales', () => {
    const token = buildJwt({ role: ' PROFESIONAL ' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(false);
  });

  it('debe retornar true para un role exactamente igual incluso con payload extendido', () => {
    const token = buildJwt({ role: 'PROFESIONAL', permiso: 'AGENDAR' });
    expect(validateUserRole(token, 'PROFESIONAL')).toBe(true);
  });
});
