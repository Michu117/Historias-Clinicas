import React, { useState, useEffect } from 'react';
import { Cita, ConsultaPsicologica } from '../../types';

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
  const [nivelAnsiedad, setNivelAnsiedad] = useState(initialData?.nivel_ansiedad ?? 50);
  const [nivelAutoestima, setNivelAutoestima] = useState(initialData?.nivel_autoestima ?? 50);
  const [diagnostico, setDiagnostico] = useState(initialData?.diagnostico || '');
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || '');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNotasEvolucion(initialData.notas_evolucion || '');
      setEstadoHumor(initialData.estado_humor || '');
      setNivelAnsiedad(initialData.nivel_ansiedad ?? 50);
      setNivelAutoestima(initialData.nivel_autoestima ?? 50);
      setDiagnostico(initialData.diagnostico || '');
      setObservaciones(initialData.observaciones || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnostico.trim()) {
      setValidationError('El campo Diagnóstico es obligatorio.');
      return;
    }
    if (!notasEvolucion.trim()) {
      setValidationError('El campo Notas de Evolución es obligatorio.');
      return;
    }
    setValidationError(null);
    onSave({
      cita: cita.id,
      historia_clinica_id: cita.paciente_id,
      notas_evolucion: notasEvolucion,
      estado_humor: estadoHumor,
      nivel_ansiedad: nivelAnsiedad,
      nivel_autoestima: nivelAutoestima,
      diagnostico,
      observaciones,
    });
  };

  const inputClass = `w-full h-12 px-4 bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] focus:bg-[var(--surface-container-high)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Notas de Evolución *</h3>
        </div>

        <label htmlFor="notasEvolucion" className="sr-only">Notas de Evolución</label>
        <textarea
          id="notasEvolucion"
          value={notasEvolucion}
          onChange={(e) => setNotasEvolucion(e.target.value)}
          disabled={!isEditable}
          className="w-full h-48 p-4 border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-[var(--on-surface-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--surface-container-low)' }}
          placeholder="Describa la evolución del paciente, observaciones de la sesión..."
        />
        <p className="text-[12px] text-[var(--on-surface-variant)] mt-2 font-medium">Este campo es obligatorio.</p>
      </section>

      <section className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-2 mb-6">
          <h3 className="text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Evaluación Psicológica</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="estadoHumor" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Estado de Humor</label>
            <input
              type="text"
              id="estadoHumor"
              value={estadoHumor}
              onChange={(e) => setEstadoHumor(e.target.value)}
              disabled={!isEditable}
              className={inputClass}
              placeholder="Ej. Estable, Ansioso, Deprimido..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="diagnostico" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Diagnóstico *</label>
            <input
              type="text"
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              disabled={!isEditable}
              className={inputClass}
              placeholder="Diagnóstico principal..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="nivelAnsiedad" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">
              Nivel de Ansiedad: <span className="text-[var(--primary)]">{nivelAnsiedad}%</span>
            </label>
            <input
              type="range"
              id="nivelAnsiedad"
              min="0"
              max="100"
              value={nivelAnsiedad}
              onChange={(e) => setNivelAnsiedad(parseInt(e.target.value, 10))}
              disabled={!isEditable}
              className="w-full h-2 bg-[var(--surface-container-low)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] font-medium">
              <span>Bajo</span>
              <span>Alto</span>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="nivelAutoestima" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">
              Nivel de Autoestima: <span className="text-[var(--primary)]">{nivelAutoestima}%</span>
            </label>
            <input
              type="range"
              id="nivelAutoestima"
              min="0"
              max="100"
              value={nivelAutoestima}
              onChange={(e) => setNivelAutoestima(parseInt(e.target.value, 10))}
              disabled={!isEditable}
              className="w-full h-2 bg-[var(--surface-container-low)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] font-medium">
              <span>Bajo</span>
              <span>Alto</span>
            </div>
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
