import React, { useState, useEffect } from 'react';
import { Cita, ConsultaSocial } from '../../types';

interface ConsultaSocialFormProps {
  cita: Cita;
  initialData?: ConsultaSocial | null;
  onSave: (data: any) => void;
  isLoading: boolean;
  isEditable: boolean;
}

const NIVELES_SOCIOECONOMICOS = [
  { value: '', label: 'Seleccione...' },
  { value: 'BAJO', label: 'Bajo' },
  { value: 'MEDIO_BAJO', label: 'Medio-Bajo' },
  { value: 'MEDIO', label: 'Medio' },
  { value: 'MEDIO_ALTO', label: 'Medio-Alto' },
  { value: 'ALTO', label: 'Alto' },
];

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
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNivelSocioeconomico(initialData.nivel_socioeconomico || '');
      setDescripcionVivienda(initialData.descripcion_vivienda || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nivelSocioeconomico) {
      setValidationError('El campo Nivel Socioeconómico es obligatorio.');
      return;
    }
    if (!descripcionVivienda.trim()) {
      setValidationError('El campo Descripción de Vivienda es obligatorio.');
      return;
    }
    setValidationError(null);
    onSave({
      cita: cita.id,
      nivel_socioeconomico: nivelSocioeconomico,
      descripcion_vivienda: descripcionVivienda,
      observaciones,
    });
  };

  const inputClass = `w-full h-12 px-4 bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] focus:bg-[var(--surface-container-high)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Información Socioeconómica</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="nivelSocioeconomico" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Nivel Socioeconómico *</label>
            <select
              id="nivelSocioeconomico"
              value={nivelSocioeconomico}
              onChange={(e) => setNivelSocioeconomico(e.target.value)}
              disabled={!isEditable}
              className={inputClass}
            >
              {NIVELES_SOCIOECONOMICOS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="descripcionVivienda" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Descripción de Vivienda *</label>
            <textarea
              id="descripcionVivienda"
              value={descripcionVivienda}
              onChange={(e) => setDescripcionVivienda(e.target.value)}
              disabled={!isEditable}
              className="w-full h-[104px] p-4 bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Describa las condiciones de vivienda del paciente..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Observaciones</h3>
        </div>

        <label htmlFor="observaciones" className="sr-only">Observaciones</label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          disabled={!isEditable}
          className="w-full h-24 p-4 bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Notas adicionales..."
        />
      </section>

      {validationError && (
        <div className="rounded-xl border p-4 text-sm font-medium" role="alert" style={{ backgroundColor: 'var(--error-container)', borderColor: 'var(--error)', color: 'var(--on-error-container)' }}>
          {validationError}
        </div>
      )}

      {isEditable && (
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 bg-[var(--primary)] text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
