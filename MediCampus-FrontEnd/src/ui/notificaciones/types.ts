export type INotificationType = 'cita' | 'derivacion';
export type INotificationState = 'no_leido' | 'leido';

export interface INotification {
  id: string;
  tipo: INotificationType;
  mensaje: string;
  estado: INotificationState;
  timestamp: string;
}
