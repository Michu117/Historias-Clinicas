export const canGenerateCertificate = (cita: { estado?: string | null }): boolean => {
  if (!cita || !cita.estado) return false;
  return String(cita.estado) === 'ATENDIDA';
};
