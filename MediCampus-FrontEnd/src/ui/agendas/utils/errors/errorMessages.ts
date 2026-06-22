/**
 * Mensajes de error mapprados a contextos específicos
 */

export const errorMessages = {
  // Autenticación
  auth: {
    tokenInvalid: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
    tokenExpired: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
    loginRequired: 'Debes iniciar sesión para acceder a esto.',
    roleNotAllowed: 'Tu rol no tiene permisos para esta acción.',
  },

  // Agendamiento (HU-01)
  agendamiento: {
    pastDate: 'No puedes agendar en fechas pasadas.',
    timeSlotUnavailable: 'El horario seleccionado no está disponible.',
    professionalNotAvailable: 'El profesional no está disponible en esa fecha y hora.',
    duplicateCita: 'Ya tienes una cita para este servicio en esta fecha.',
    serviceInactive: 'Este servicio no está disponible.',
    citaCreatedSuccess: 'Cita agendada exitosamente.',
    citaCreateError: 'No se pudo agendar la cita. Intenta nuevamente.',
  },

  // Agenda (HU-02)
  agenda: {
    noCitas: 'No hay citas agendadas en el rango de fechas seleccionado.',
    loadError: 'Error al cargar las citas. Intenta nuevamente.',
    filterError: 'Error al aplicar filtros. Intenta nuevamente.',
  },

  // Consulta (HU-03, HU-04)
  consulta: {
    citaNotFound: 'La cita no fue encontrada.',
    consultaCreatedSuccess: 'Consulta registrada exitosamente.',
    consultaCreateError: 'No se pudo registrar la consulta. Intenta nuevamente.',
    invalidSignosVitales: 'Valores de signos vitales inválidos.',
    invalidDiagnosis: 'El diagnóstico es requerido.',
  },

  // Derivación (HU-05)
  derivacion: {
    derivacionCreatedSuccess: 'Derivación enviada exitosamente.',
    derivacionCreateError: 'No se pudo crear la derivación. Intenta nuevamente.',
    invalidReason: 'El motivo de la derivación es requerido.',
    noDestinationService: 'Debe seleccionar un servicio de destino.',
  },

  // Certificados (HU-06)
  certificado: {
    certificateGenerated: 'Certificado generado exitosamente.',
    certificateGenerateError: 'No se pudo generar el certificado. Intenta nuevamente.',
    noCitaForCertificate: 'No hay cita completada para generar certificado.',
  },

  // Generales
  general: {
    networkError: 'Error de conexión. Verifica tu conexión a internet.',
    timeout: 'La solicitud tardó demasiado. Intenta nuevamente.',
    unexpectedError: 'Ocurrió un error inesperado. Intenta nuevamente.',
    fieldsRequired: 'Por favor completa todos los campos requeridos.',
    invalidEmail: 'Email inválido.',
    invalidPhone: 'Teléfono inválido.',
  },
};
