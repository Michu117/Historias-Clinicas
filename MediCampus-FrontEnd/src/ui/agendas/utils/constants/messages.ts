/**
 * Mensajes constantes para la UI
 */

export const messages = {
  // Títulos
  titles: {
    agendarCita: 'Agendar Cita',
    miAgenda: 'Mi Agenda',
    registrarConsulta: 'Registrar Consulta',
    registrarSignosVitales: 'Registrar Signos Vitales',
    gestionarDerivaciones: 'Gestionar Derivaciones',
    misCertificados: 'Mis Certificados',
  },

  // Acciones
  actions: {
    guardar: 'Guardar',
    cancelar: 'Cancelar',
    aceptar: 'Aceptar',
    rechazar: 'Rechazar',
    eliminar: 'Eliminar',
    editar: 'Editar',
    descargar: 'Descargar',
    imprimir: 'Imprimir',
    enviar: 'Enviar',
    volver: 'Volver',
    siguiente: 'Siguiente',
    anterior: 'Anterior',
  },

  // Placeholders
  placeholders: {
    selectService: 'Selecciona un servicio...',
    selectProfessional: 'Selecciona un profesional...',
    selectDate: 'Selecciona una fecha...',
    selectTime: 'Selecciona una hora...',
    reasonCita: 'Motivo de la cita (opcional)',
    diagnosis: 'Diagnóstico de la consulta',
    prescription: 'Prescripción médica (opcional)',
    clinicalNotes: 'Notas clínicas (opcional)',
    referralReason: 'Motivo de la derivación',
  },

  // Validación
  validation: {
    required: 'Este campo es obligatorio.',
    invalidDate: 'Fecha inválida.',
    invalidTime: 'Hora inválida.',
    futureDateRequired: 'Debe ser una fecha futura.',
    minLength: (min: number) => `Mínimo ${min} caracteres.`,
    maxLength: (max: number) => `Máximo ${max} caracteres.`,
    invalidEmail: 'Email inválido.',
    invalidPhone: 'Teléfono inválido.',
  },

  // Derivación
  derivacion: {
    modalTitle: 'Derivar Paciente',
    selectDestino: 'Selecciona un servicio...',
    servicioDestino: 'Servicio Destino',
    motivo: 'Motivo',
    motivoPlaceholder: 'Describe el motivo de la derivación (mín. 10 caracteres)',
    motivoMinLength: 'El motivo debe tener al menos 10 caracteres.',
    derivar: 'Derivar',
    noPendientes: 'No hay derivaciones pendientes',
    inboxTitle: 'Derivaciones Pendientes',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    pendiente: 'Pendiente',
    confirmarRechazo: '¿Está seguro de que desea rechazar esta derivación?',
  },

  // Certificados
  certificados: {
    descargarCertificado: 'Descargar Certificado',
    generandoCertificado: 'Generando certificado...',
    certificadoGenerado: 'Certificado descargado exitosamente.',
    errorGenerar: 'No se pudo generar el certificado. Intenta de nuevo.',
    soloAtendida: 'El certificado solo está disponible para citas atendidas.',
  },

  // Errores
  errors: {
    observacionesMinLength: 'Las observaciones deben tener al menos 10 caracteres.',
    signosVitalesRequired: 'Todos los signos vitales son obligatorios.',
  },

  // Confirmaciones
  confirmations: {
    deleteCita: '¿Está seguro de que desea cancelar esta cita?',
    deleteConsulta: '¿Está seguro de que desea eliminar esta consulta?',
    rejectDerivation: '¿Está seguro de que desea rechazar esta derivación?',
  },

  // Estados
  states: {
    loading: 'Cargando...',
    saving: 'Guardando...',
    deleting: 'Eliminando...',
    error: 'Error',
    success: 'Éxito',
    noResults: 'Sin resultados',
  },

  // Fechas/Horas
  dateTime: {
    today: 'Hoy',
    tomorrow: 'Mañana',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
  },
};
