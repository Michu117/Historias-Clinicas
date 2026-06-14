import React from 'react';
import { Cita, Consulta } from '../../types';
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
  serviceName?: string; // Optional override for testing
}

export const ConsultaForm: React.FC<ConsultaFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  error,
  isEditable,
  serviceName: overrideServiceName,
}) => {
  const serviceName = overrideServiceName || cita.servicios?.[0]?.nombre;

  const renderForm = () => {
    switch (serviceName) {
      case 'Medicina General':
        return (
          <ConsultaMedicaForm
            cita={cita}
            initialData={initialData}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Odontología':
        return (
          <ConsultaOdontologicaForm
            cita={cita}
            initialData={initialData}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Psicología':
        return (
          <ConsultaPsicologicaForm
            cita={cita}
            initialData={initialData}
            onSave={onSave}
            isLoading={isLoading}
            isEditable={isEditable}
          />
        );
      case 'Trabajo Social':
        return (
          <ConsultaSocialForm
            cita={cita}
            initialData={initialData}
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