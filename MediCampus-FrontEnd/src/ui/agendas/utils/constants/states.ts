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
    AGENDADA: 'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
    COMPLETADA: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
    CANCELADA: 'bg-red-100 text-red-800',
    NO_ASISTIO: 'bg-[var(--surface-container-low)] text-[var(--on-surface-variant)]',
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
    PENDIENTE: 'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
    ACEPTADA: 'bg-[var(--secondary-container)] text-[var(--on-secondary-container)]',
    RECHAZADA: 'bg-red-100 text-red-800',
    COMPLETADA: 'bg-[var(--primary-container)] text-[var(--on-primary-container)]',
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
