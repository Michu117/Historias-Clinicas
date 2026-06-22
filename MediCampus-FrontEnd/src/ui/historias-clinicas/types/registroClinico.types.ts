export type TipoRegistroClinico = 'ALERGIA' | 'FACTOR_RIESGO';

export interface RegistroClinicoHistoria {
  id: string;
  historia_clinica: number;
  tipo: TipoRegistroClinico;
  descripcion: string;
  fecha_registro: string;
  medico_registro: number | null;
  medico_registro_nombre: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
