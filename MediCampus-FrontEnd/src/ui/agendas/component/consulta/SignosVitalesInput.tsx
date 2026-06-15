import React, { useState, useEffect } from 'react';
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
  const [pesoKg, setPesoKg] = useState(initialData?.peso_kg || 0);
  const [temperatura, setTemperatura] = useState(initialData?.temperatura || 0);
  const [presionArterial, setPresionArterial] = useState(initialData?.presion_arterial || '');
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState(initialData?.frecuencia_cardiaca || 0);

  useEffect(() => {
    if (initialData) {
      setPesoKg(initialData.peso_kg || 0);
      setTemperatura(initialData.temperatura || 0);
      setPresionArterial(initialData.presion_arterial || '');
      setFrecuenciaCardiaca(initialData.frecuencia_cardiaca || 0);
    }
  }, [initialData]);

  useEffect(() => {
    onUpdate({
      peso_kg: pesoKg,
      temperatura: temperatura,
      presion_arterial: presionArterial,
      frecuencia_cardiaca: frecuenciaCardiaca,
    });
  }, [pesoKg, temperatura, presionArterial, frecuenciaCardiaca, onUpdate]);

  const handleValueChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
  };

  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setter(isNaN(value) ? 0 : value);
  };

  const inputClass = `w-full h-11 px-4 bg-[#f1f3ff] border border-[#c4c6d0] rounded-xl text-sm focus:ring-2 focus:ring-[#0056b3] focus:bg-white outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="space-y-2">
        <label htmlFor="peso_kg" className="text-[11px] font-black text-[#44474e] uppercase tracking-[0.1em]">Peso (kg)</label>
        <input
          type="number"
          id="peso_kg"
          value={pesoKg}
          onChange={handleNumericChange(setPesoKg)}
          disabled={!isEditable}
          className={inputClass}
          step="0.01"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="temperatura" className="text-[11px] font-black text-[#44474e] uppercase tracking-[0.1em]">Temperatura (°C)</label>
        <input
          type="number"
          id="temperatura"
          value={temperatura}
          onChange={handleNumericChange(setTemperatura)}
          disabled={!isEditable}
          className={inputClass}
          step="0.1"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="presion_arterial" className="text-[11px] font-black text-[#44474e] uppercase tracking-[0.1em]">Presión Arterial</label>
        <input
          type="text"
          id="presion_arterial"
          value={presionArterial}
          onChange={handleValueChange(setPresionArterial)}
          disabled={!isEditable}
          className={inputClass}
          placeholder="Ej. 120/80"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="frecuencia_cardiaca" className="text-[11px] font-black text-[#44474e] uppercase tracking-[0.1em]">Frecuencia Cardíaca (bpm)</label>
        <input
          type="number"
          id="frecuencia_cardiaca"
          value={frecuenciaCardiaca}
          onChange={handleNumericChange(setFrecuenciaCardiaca)}
          disabled={!isEditable}
          className={inputClass}
        />
      </div>
    </div>
  );
};
