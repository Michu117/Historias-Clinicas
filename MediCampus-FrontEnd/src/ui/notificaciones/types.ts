export type INotificationType = 'cita' | 'derivacion';
export type INotificationState = 'no_leido' | 'leido';

export interface INotification {
  id: string;
  tipo: INotificationType;
  tipoBackend: string;
  mensaje: string;
  estado: INotificationState;
  fecha_creacion: string;
  timestamp: string;
}
