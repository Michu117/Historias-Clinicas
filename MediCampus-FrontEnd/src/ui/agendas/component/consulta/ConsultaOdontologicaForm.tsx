import React, { useState, useEffect } from 'react';
import { Cita, ConsultaOdontologica } from '../../types';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setOdontograma(initialData.odontograma || '');
      setProcedimientos(initialData.procedimientos || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odontograma.trim()) {
      setValidationError('El campo Odontograma es obligatorio.');
      return;
    }
    if (!procedimientos.trim()) {
      setValidationError('El campo Procedimientos es obligatorio.');
      return;
    }
    setValidationError(null);
    onSave({
      cita: cita.id,
      historia_clinica_id: cita.paciente_id,
      odontograma,
      procedimientos,
      observaciones,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Odontograma *</h3>
        </div>

        <label htmlFor="odontograma" className="sr-only">Odontograma</label>
        <textarea
          id="odontograma"
          value={odontograma}
          onChange={(e) => setOdontograma(e.target.value)}
          disabled={!isEditable}
          className="w-full h-48 p-4 border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
          placeholder="Describa el estado dental, hallazgos del odontograma..."
        />
        <p className="text-[12px] text-[var(--on-surface-variant)] mt-2 font-medium">Este campo es obligatorio.</p>
      </section>

      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Procedimientos Realizados *</h3>
        </div>

        <label htmlFor="procedimientos" className="sr-only">Procedimientos</label>
        <textarea
          id="procedimientos"
          value={procedimientos}
          onChange={(e) => setProcedimientos(e.target.value)}
          disabled={!isEditable}
          className="w-full h-[104px] p-4 border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
          placeholder="Describa los procedimientos realizados..."
        />
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
          className="w-full h-24 p-4 border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
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
