import React, { useState, useEffect } from 'react';
import { Cita, ConsultaOdontologica } from '../../types';
import { validateObservaciones } from '../../utils/validators/consultaValidators';
import { messages } from '../../utils/constants/messages';
import { ConsultaBaseForm } from './ConsultaBaseForm';

interface ConsultaOdontologicaFormProps {
  cita: Cita;
  initialData?: ConsultaOdontologica | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
}

export const ConsultaOdontologicaForm: React.FC<ConsultaOdontologicaFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  isEditable,
}) => {
  const [odontograma, setOdontograma] = useState(initialData?.odontograma || '');
  const [procedimientos, setProcedimientos] = useState(initialData?.procedimientos || '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');

  useEffect(() => {
    if (initialData) {
      setOdontograma(initialData.odontograma || '');
      setProcedimientos(initialData.procedimientos || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const getFormData = () => ({
    cita: cita.id,
    historia_clinica_id: cita.paciente_id,
    odontograma,
    procedimientos,
    observaciones,
  });

  const renderFields = () => (
    <>
      <div>
        <label htmlFor="odontograma" className="block text-sm font-medium text-gray-700">
          Odontograma
        </label>
        <textarea
          id="odontograma"
          value={odontograma}
          onChange={(e) => setOdontograma(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>

      <div>
        <label htmlFor="procedimientos" className="block text-sm font-medium text-gray-700">
          Procedimientos
        </label>
        <textarea
          id="procedimientos"
          value={procedimientos}
          onChange={(e) => setProcedimientos(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>

      <div>
        <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>
    </>
  );

  return (
    <ConsultaBaseForm<ConsultaOdontologica>
      cita={cita}
      initialData={initialData}
      onSave={onSave}
      isLoading={isLoading}
      isEditable={isEditable}
      renderFields={renderFields}
      getFormData={getFormData}
    />
  );
};