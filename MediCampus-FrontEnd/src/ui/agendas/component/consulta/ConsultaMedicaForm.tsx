import React, { useState, useEffect } from 'react';
import { Cita, ConsultaMedica, SignosVitales } from '../../types';
import { SignosVitalesInput } from './SignosVitalesInput';
import { validateObservaciones } from '../../utils/validators/consultaValidators';
import { messages } from '../../utils/constants/messages';
import { ConsultaBaseForm } from './ConsultaBaseForm';

interface ConsultaMedicaFormProps {
  cita: Cita;
  initialData?: ConsultaMedica | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
}

export const ConsultaMedicaForm: React.FC<ConsultaMedicaFormProps> = ({
  cita,
  initialData,
  onSave,
  isLoading,
  isEditable,
}) => {
  const [anamnesis, setAnamnesis] = useState(initialData?.anamnesis || '');
  const [tratamiento, setTratamiento] = useState(initialData?.tratamiento || '');
  const [diagnostico, setDiagnostico] = useState(initialData?.diagnostico || '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');
  const [signosVitales, setSignosVitales] = useState<SignosVitales | null>(initialData?.signos_vitales || null);

  useEffect(() => {
    if (initialData) {
      setAnamnesis(initialData.anamnesis || '');
      setTratamiento(initialData.tratamiento || '');
      setDiagnostico(initialData.diagnostico || '');
      setObservaciones(initialData.observaciones || '');
      setSignosVitales(initialData.signos_vitales || null);
    }
  }, [initialData]);

  const handleSignosVitalesUpdate = (sv: Partial<SignosVitales>) => {
    setSignosVitales((prev) => ({
      ...prev,
      peso_kg: sv.peso_kg ?? prev?.peso_kg,
      temperatura: sv.temperatura ?? prev?.temperatura,
      presion_arterial: sv.presion_arterial ?? prev?.presion_arterial,
      frecuencia_cardiaca: sv.frecuencia_cardiaca ?? prev?.frecuencia_cardiaca,
    }) as SignosVitales);
  };

  const getFormData = () => ({
    cita: cita.id,
    historia_clinica_id: cita.usuario_id,
    anamnesis,
    tratamiento,
    diagnostico,
    observaciones,
    signos_vitales: signosVitales,
  });

  const renderFields = () => (
    <>
      <div>
        <label htmlFor="anamnesis" className="block text-sm font-medium text-gray-700">
          Anamnesis
        </label>
        <textarea
          id="anamnesis"
          value={anamnesis}
          onChange={(e) => setAnamnesis(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
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
        <label htmlFor="tratamiento" className="block text-sm font-medium text-gray-700">
          Tratamiento
        </label>
        <textarea
          id="tratamiento"
          value={tratamiento}
          onChange={(e) => setTratamiento(e.target.value)}
          disabled={!isEditable}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
        ></textarea>
      </div>

      <SignosVitalesInput onUpdate={handleSignosVitalesUpdate} initialData={signosVitales} isEditable={isEditable} />

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
    <ConsultaBaseForm<ConsultaMedica>
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