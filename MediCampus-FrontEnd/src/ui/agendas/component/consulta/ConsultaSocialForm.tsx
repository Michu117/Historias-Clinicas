import React, { useState, useEffect } from 'react';
import { Cita, ConsultaSocial } from '../../types';
import { validateObservaciones } from '../../utils/validators/consultaValidators';
import { messages } from '../../utils/constants/messages';
import { ConsultaBaseForm } from './ConsultaBaseForm';

interface ConsultaSocialFormProps {
  cita: Cita;
  initialData?: ConsultaSocial | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
}

export const ConsultaSocialForm: React.FC<ConsultaSocialFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  isEditable,
}) => {
  const [nivelSocioeconomico, setNivelSocioeconomico] = useState(initialData?.nivel_socioeconomico || '');
  const [descripcionVivienda, setDescripcionVivienda] = useState(initialData?.descripcion_vivienda || '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');

  useEffect(() => {
    if (initialData) {
      setNivelSocioeconomico(initialData.nivel_socioeconomico || '');
      setDescripcionVivienda(initialData.descripcion_vivienda || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const getFormData = () => ({
    cita: cita.id,
    historia_clinica_id: cita.usuario_id,
    nivel_socioeconomico: nivelSocioeconomico,
    descripcion_vivienda: descripcionVivienda,
    observaciones,
  });

  const renderFields = () => (
    <>
      <div>
        <label htmlFor="nivelSocioeconomico" className="block text-sm font-medium text-gray-700">
          Nivel Socioeconómico
        </label>
        <input
          type="text"
          id="nivelSocioeconomico"
          value={nivelSocioeconomico}
          onChange={(e) => setNivelSocioeconomico(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="descripcionVivienda" className="block text-sm font-medium text-gray-700">
          Descripción de Vivienda
        </label>
        <textarea
          id="descripcionVivienda"
          value={descripcionVivienda}
          onChange={(e) => setDescripcionVivienda(e.target.value)}
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
    <ConsultaBaseForm<ConsultaSocial>
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