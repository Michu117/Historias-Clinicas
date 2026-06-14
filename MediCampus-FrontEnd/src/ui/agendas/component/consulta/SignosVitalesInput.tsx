import React, { useState, useEffect } from 'react';
import { SignosVitales } from '../../types';
import { messages } from '../../utils/constants/messages';

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
    // Llama a onUpdate cada vez que los valores cambian internamente
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

  return (
    <div className="space-y-4 rounded-md border p-4 bg-gray-50">
      <h3 className="text-lg font-semibold">{messages.titles.registrarSignosVitales}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="peso_kg" className="block text-sm font-medium text-gray-700">
            Peso (kg)
          </label>
          <input
            type="number"
            id="peso_kg"
            value={pesoKg}
            onChange={handleNumericChange(setPesoKg)}
            disabled={!isEditable}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="temperatura" className="block text-sm font-medium text-gray-700">
            Temperatura (°C)
          </label>
          <input
            type="number"
            id="temperatura"
            value={temperatura}
            onChange={handleNumericChange(setTemperatura)}
            disabled={!isEditable}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            step="0.1"
          />
        </div>
        <div>
          <label htmlFor="presion_arterial" className="block text-sm font-medium text-gray-700">
            Presión Arterial (Ej. 120/80)
          </label>
          <input
            type="text"
            id="presion_arterial"
            value={presionArterial}
            onChange={handleValueChange(setPresionArterial)}
            disabled={!isEditable}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="frecuencia_cardiaca" className="block text-sm font-medium text-gray-700">
            Frecuencia Cardíaca (bpm)
          </label>
          <input
            type="number"
            id="frecuencia_cardiaca"
            value={frecuenciaCardiaca}
            onChange={handleNumericChange(setFrecuenciaCardiaca)}
            disabled={!isEditable}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>
    </div>
  );
};