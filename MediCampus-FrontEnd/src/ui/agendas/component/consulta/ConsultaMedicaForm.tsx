import React, { useState, useEffect } from 'react';
import { Cita, ConsultaMedica, SignosVitales } from '../../types';
import { SignosVitalesInput } from './SignosVitalesInput';
import { validateObservaciones } from '../../utils/validators/consultaValidators';

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
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateObservaciones(observaciones)) {
      setValidationError('Las observaciones deben tener al menos 10 caracteres.');
      return;
    }
    setValidationError(null);
    onSave({
      cita: cita.id,
      historia_clinica_id: cita.paciente_id,
      anamnesis,
      tratamiento,
      diagnostico,
      observaciones,
      signos_vitales: signosVitales,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white border border-[#d3d9f0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Anamnesis y Evolución *</h3>
        </div>

        <label htmlFor="anamnesis" className="sr-only">Anamnesis</label>
        <textarea
          id="anamnesis"
          value={anamnesis}
          onChange={(e) => setAnamnesis(e.target.value)}
          disabled={!isEditable}
          className="w-full h-48 p-4 bg-[#f1f3ff] border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] focus:bg-white outline-none transition-all placeholder:text-[#74777f] disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Ingrese los detalles de la consulta, síntomas, evolución..."
        />
        <p className="text-[12px] text-[#44474e] mt-2 font-medium">Este campo es obligatorio.</p>

        <div className="mt-6 space-y-4">
          <label htmlFor="tratamiento" className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Tratamiento / Indicaciones</label>
          <textarea
            id="tratamiento"
            value={tratamiento}
            onChange={(e) => setTratamiento(e.target.value)}
            disabled={!isEditable}
            className="w-full h-[104px] p-4 bg-white border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Instrucciones para el paciente..."
          />
        </div>

        <div className="mt-6 space-y-4">
          <label htmlFor="observaciones" className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Observaciones</label>
          <textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={!isEditable}
            className="w-full h-24 p-4 bg-white border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Notas adicionales..."
          />
        </div>
      </section>

      <section className="bg-white border border-[#d3d9f0] rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[#44474e] uppercase tracking-[0.1em]">Signos Vitales</h3>
        </div>
        <SignosVitalesInput onUpdate={handleSignosVitalesUpdate} initialData={signosVitales} isEditable={isEditable} />
      </section>

      {validationError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 text-sm font-medium" role="alert">
          {validationError}
        </div>
      )}

      {isEditable && (
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 bg-[#0056b3] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </span>
            ) : (
              'Guardar Consulta'
            )}
          </button>
        </div>
      )}
    </form>
  );
};
