import React, { useState, useEffect } from 'react';
import { Cita, ConsultaPsicologica } from '../../types';
import { validateObservaciones } from '../../utils/validators/consultaValidators';
import { messages } from '../../utils/constants/messages';
import { ConsultaBaseForm } from './ConsultaBaseForm';

interface ConsultaPsicologicaFormProps {
  cita: Cita;
  initialData?: ConsultaPsicologica | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
}

export const ConsultaPsicologicaForm: React.FC<ConsultaPsicologicaFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  isEditable,
}) => {
  const [notasEvolucion, setNotasEvolucion] = useState(initialData?.notas_evolucion || '');
  const [estadoHumor, setEstadoHumor] = useState(initialData?.estado_humor || '');
  const [nivelAnsiedad, setNivelAnsiedad] = useState(initialData?.nivel_ansiedad || 0);
  const [nivelAutoestima, setNivelAutoestima] = useState(initialData?.nivel_autoestima || 0);
  const [diagnostico, setDiagnostico] = useState(initialData?.diagnostico || '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');

  useEffect(() => {
    if (initialData) {
      setNotasEvolucion(initialData.notas_evolucion || '');
      setEstadoHumor(initialData.estado_humor || '');
      setNivelAnsiedad(initialData.nivel_ansiedad || 0);
      setNivelAutoestima(initialData.nivel_autoestima || 0);
      setDiagnostico(initialData.diagnostico || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const getFormData = () => ({
    cita: cita.id,
    historia_clinica_id: cita.usuario_id,
    notas_evolucion: notasEvolucion,
    estado_humor: estadoHumor,
    nivel_ansiedad: nivelAnsiedad,
    nivel_autoestima: nivelAutoestima,
    diagnostico,
    observaciones,
  });

  const renderFields = () => (
    <>
      <div>
        <label htmlFor="notasEvolucion" className="block text-sm font-medium text-gray-700">
          Notas de Evolución
        </label>
        <textarea
          id="notasEvolucion"
          value={notasEvolucion}
          onChange={(e) => setNotasEvolucion(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>

      <div>
        <label htmlFor="estadoHumor" className="block text-sm font-medium text-gray-700">
          Estado de Humor
        </label>
        <input
          type="text"
          id="estadoHumor"
          value={estadoHumor}
          onChange={(e) => setEstadoHumor(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="nivelAnsiedad" className="block text-sm font-medium text-gray-700">
          Nivel de Ansiedad (0-100)
        </label>
        <input
          type="range"
          id="nivelAnsiedad"
          min="0"
          max="100"
          value={nivelAnsiedad}
          onChange={(e) => setNivelAnsiedad(parseInt(e.target.value, 10))}
          disabled={!isEditable}
          className="mt-1 block w-full"
        />
        <p className="text-sm text-gray-500">Valor: {nivelAnsiedad}</p>
      </div>

      <div>
        <label htmlFor="nivelAutoestima" className="block text-sm font-medium text-gray-700">
          Nivel de Autoestima (0-100)
        </label>
        <input
          type="range"
          id="nivelAutoestima"
          min="0"
          max="100"
          value={nivelAutoestima}
          onChange={(e) => setNivelAutoestima(parseInt(e.target.value, 10))}
          disabled={!isEditable}
          className="mt-1 block w-full"
        />
        <p className="text-sm text-gray-500">Valor: {nivelAutoestima}</p>
      </div>

      <div>
        <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700">
          Diagnóstico
        </label>
        <textarea
          id="diagnostico"
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
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
    <ConsultaBaseForm<ConsultaPsicologica>
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