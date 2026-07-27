import type { Caso } from './caso.types';
import type { AntecedenteClinico } from './antecedenteClinico.types';
import type { DocumentoClinico } from './documentoClinico.types';

export type EstadoHistoriaClinica = 'ACTIVA' | 'CERRADA';

export interface UsuarioHistoriaClinica {
  nombre: string;
  identificacion: string;
}

export interface HistoriaClinica {
  id: string;
  alergia: string;
  condicionPreexistente: string;
  condicionPreexistenteUltimaConsulta?: string | null;
  factorRiesgo: string;
  fechaApertura?: string;
  ultimaActualizacion?: string;
  estado: EstadoHistoriaClinica;
  usuario: UsuarioHistoriaClinica;
  responsable?: string;
}

export interface HistoriaClinicaFormValues {
  usuarioNombre: string;
  usuarioIdentificacion: string;
  alergia: string;
  condicionPreexistente: string;
  factorRiesgo: string;
}
