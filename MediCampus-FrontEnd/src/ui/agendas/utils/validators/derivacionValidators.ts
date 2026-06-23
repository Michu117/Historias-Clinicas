export const validateDerivationDestiny = (servicioActual: number | string, servicioDest: number | string): boolean => {
  return Number(servicioActual) !== Number(servicioDest);
};

export const validateMotivo = (motivo: string): boolean => {
  if (!motivo) return false;
  return motivo.trim().length >= 10;
};
