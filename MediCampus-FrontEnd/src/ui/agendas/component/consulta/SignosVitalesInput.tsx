import React, { useState, useEffect, useRef } from 'react';
import { SignosVitales } from '../../types';

interface SignosVitalesInputProps {
  initialData?: SignosVitales | null;
  onUpdate: (sv: Partial<SignosVitales>) => void;
  isEditable: boolean;
}

export const SignosVitalesInput: React.FC<SignosVitalesInputProps> = ({
  initialData,
  onUpdate,
  isEditable,
}) => {
  const [pesoKg, setPesoKg] = useState(initialData?.peso_kg != null ? String(initialData.peso_kg) : '');
  const [temperatura, setTemperatura] = useState(initialData?.temperatura != null ? String(initialData.temperatura) : '');
  const [presionArterial, setPresionArterial] = useState(initialData?.presion_arterial || '');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState(initialData?.frecuencia_cardiaca != null ? String(initialData.frecuencia_cardiaca) : '');
  const synced = useRef(false);

  useEffect(() => {
    if (initialData && !synced.current) {
      synced.current = true;
      if (initialData.peso_kg != null) setPesoKg(String(initialData.peso_kg));
      if (initialData.temperatura != null) setTemperatura(String(initialData.temperatura));
      if (initialData.presion_arterial) setPresionArterial(initialData.presion_arterial);
      if (initialData.frecuencia_cardiaca != null) setFrecuenciaCardiaca(String(initialData.frecuencia_cardiaca));
    }
  }, [initialData]);

  useEffect(() => {
    onUpdate({
      peso_kg: pesoKg === '' ? 0 : parseFloat(pesoKg) || 0,
      temperatura: temperatura === '' ? 0 : parseFloat(temperatura) || 0,
      presion_arterial: presionArterial,
      frecuencia_cardiaca: frecuenciaCardiaca === '' ? 0 : parseFloat(frecuenciaCardiaca) || 0,
    });
  }, [pesoKg, temperatura, presionArterial, frecuenciaCardiaca, onUpdate]);

  const inputClass = `w-full h-11 px-4 bg-[var(--surface-container-low)] border border-[var(--outline)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--primary)] focus:bg-white outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="space-y-2">
        <label htmlFor="peso_kg" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Peso (kg)</label>
        <input
          type="text"
          inputMode="decimal"
          id="peso_kg"
          value={pesoKg}
          onChange={(e) => setPesoKg(e.target.value)}
          disabled={!isEditable}
          className={inputClass}
          placeholder="0"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="temperatura" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Temperatura (°C)</label>
        <input
          type="text"
          inputMode="decimal"
          id="temperatura"
          value={temperatura}
          onChange={(e) => setTemperatura(e.target.value)}
          disabled={!isEditable}
          className={inputClass}
          placeholder="0.0"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="presion_arterial" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Presión Arterial</label>
        <input
          type="text"
          id="presion_arterial"
          value={presionArterial}
          onChange={(e) => setPresionArterial(e.target.value)}
          disabled={!isEditable}
          className={inputClass}
          placeholder="Ej. 120/80"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="frecuencia_cardiaca" className="text-[11px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.1em]">Frecuencia Cardíaca (bpm)</label>
        <input
          type="text"
          inputMode="numeric"
          id="frecuencia_cardiaca"
          value={frecuenciaCardiaca}
          onChange={(e) => setFrecuenciaCardiaca(e.target.value)}
          disabled={!isEditable}
          className={inputClass}
          placeholder="0"
        />
      </div>
    </div>
  );
};
