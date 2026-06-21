/**
 * Estados constantes de entidades
 */

export const states = {
  // Estados de Cita (RN-001 a RN-005)
  cita: {
    AGENDADA: 'AGENDADA',
    COMPLETADA: 'COMPLETADA',
    CANCELADA: 'CANCELADA',
    NO_ASISTIO: 'NO_ASISTIO',
  },

  citaLabels: {
    AGENDADA: 'Agendada',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
    NO_ASISTIO: 'No Asistió',
  },

  citaColors: {
    AGENDADA: 'bg-blue-100 text-blue-800',
    COMPLETADA: 'bg-green-100 text-green-800',
    CANCELADA: 'bg-red-100 text-red-800',
    NO_ASISTIO: 'bg-gray-100 text-gray-800',
  },

  // Estados de Derivación
  derivacion: {
    PENDIENTE: 'PENDIENTE',
    ACEPTADA: 'ACEPTADA',
    RECHAZADA: 'RECHAZADA',
    COMPLETADA: 'COMPLETADA',
  },

  derivacionLabels: {
    PENDIENTE: 'Pendiente',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada',
    COMPLETADA: 'Completada',
  },

  derivacionColors: {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    ACEPTADA: 'bg-green-100 text-green-800',
    RECHAZADA: 'bg-red-100 text-red-800',
    COMPLETADA: 'bg-blue-100 text-blue-800',
  },

  // Tipos de Consulta
  consulta: {
    CONSULTA_MEDICA: 'CONSULTA_MEDICA',
    SIGNOS_VITALES: 'SIGNOS_VITALES',
  },

  consultaLabels: {
    CONSULTA_MEDICA: 'Consulta Médica',
    SIGNOS_VITALES: 'Signos Vitales',
  },

  // Roles de Usuario
  rol: {
    PACIENTE: 'PACIENTE',
    PROFESIONAL: 'PROFESIONAL',
    ADMIN: 'ADMIN',
  },

  rolLabels: {
    PACIENTE: 'Paciente',
    PROFESIONAL: 'Profesional',
    ADMIN: 'Administrador',
  },

  // Sexo
  sexo: {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro',
  },
};
