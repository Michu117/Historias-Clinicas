import React from 'react';
import { Cita, Consulta, ConsultaMedica, ConsultaOdontologica, ConsultaPsicologica, ConsultaSocial } from '../../types';
import { ConsultaMedicaForm } from './ConsultaMedicaForm';
import { ConsultaOdontologicaForm } from './ConsultaOdontologicaForm';
import { ConsultaPsicologicaForm } from './ConsultaPsicologicaForm';
import { ConsultaSocialForm } from './ConsultaSocialForm';

interface ConsultaFormProps {
  cita: Cita;
  initialData?: Consulta | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  error: string | null;
  isEditable: boolean;
  serviceName?: string;
}

const SERVICE_NAME_MAP: Record<number, string> = {
  1: 'Medicina General',
  2: 'Odontología',
  3: 'Trabajo Social',
  4: 'Psicología',
};

export const ConsultaForm: React.FC<ConsultaFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  error,
  isEditable,
  serviceName: overrideServiceName,
}) => {
  const serviceName = overrideServiceName || SERVICE_NAME_MAP[cita.servicio_id];

  const renderForm = () => {
    switch (serviceName) {
      case 'Medicina General':
        return (
          <ConsultaMedicaForm
            cita={cita}
            initialData={initialData as ConsultaMedica | null | undefined}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Odontología':
        return (
          <ConsultaOdontologicaForm
            cita={cita}
            initialData={initialData as ConsultaOdontologica | null | undefined}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Psicología':
        return (
          <ConsultaPsicologicaForm
            cita={cita}
            initialData={initialData as ConsultaPsicologica | null | undefined}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Trabajo Social':
        return (
          <ConsultaSocialForm
            cita={cita}
            initialData={initialData as ConsultaSocial | null | undefined}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      default:
        return <p className="text-red-500">Tipo de servicio no reconocido.</p>;
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {renderForm()}
    </div>
  );
};