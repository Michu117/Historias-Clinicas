export const validateObservaciones = (observaciones: string): boolean => {
    if (!observaciones) return false;
    return observaciones.trim().length >= 10;
};

export const isConsultaEditable = (consulta: { fecha_creacion?: string | null }): boolean => {
    return !consulta.fecha_creacion;
};