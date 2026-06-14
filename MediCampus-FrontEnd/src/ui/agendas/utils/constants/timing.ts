/**
 * Constantes de timing y duraciones
 */

export const timing = {
  // Duración estándar de cita (RN-002: 30 minutos)
  citaDurationMinutes: 30,

  // Margen entre citas (RN-002: 30 minutos)
  citaMarginMinutes: 30,

  // Timeouts
  apiTimeout: 30000, // 30 segundos
  requestTimeout: 10000, // 10 segundos
  debounceDelay: 300, // 300ms para inputs
  toastDuration: 3000, // 3 segundos
  loadingDelay: 500, // 500ms antes de mostrar loading

  // Tokens JWT
  tokenExpirationWarning: 5 * 60 * 1000, // Alertar 5 min antes de expiración
  tokenRefreshThreshold: 1 * 60 * 1000, // Refrescar token si faltan menos de 1 min

  // Validación de fechas
  minDaysInAdvance: 1, // Mínimo 1 día adelante para agendar
  maxDaysInAdvance: 90, // Máximo 90 días adelante para agendar

  // Horarios de atención (formato HH:mm)
  scheduleStart: '08:00', // Hora de apertura
  scheduleEnd: '18:00', // Hora de cierre
  scheduleBreakStart: '12:00', // Inicio descanso
  scheduleBreakEnd: '13:00', // Fin descanso

  // Polling y sincronización
  pollingIntervalShort: 5000, // 5 segundos para datos críticos
  pollingIntervalMedium: 15000, // 15 segundos para datos normales
  pollingIntervalLong: 60000, // 1 minuto para datos no críticos

  // Retries
  maxRetries: 3,
  retryDelayMs: 1000,
  backoffMultiplier: 2, // Exponential backoff: 1s, 2s, 4s
};
