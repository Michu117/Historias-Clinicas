import React from 'react';
import { Profesional } from '../../types';
import { SelectorField } from '../shared/SelectorField';
import { messages } from '../../utils/constants/messages';

interface ProfessionalSelectorProps {
  profesionales: Profesional[];
  selectedProfessionalId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export const ProfessionalSelector: React.FC<ProfessionalSelectorProps> = ({ profesionales, selectedProfessionalId, onSelect, isLoading }) => {
  const options = profesionales.map((prof) => ({
    id: prof.id,
    label: prof.nombre,
    isActive: prof.is_activo === true,
  }));

  return (
    <SelectorField
      label="Selecciona un profesional"
      placeholder={messages.placeholders.selectProfessional}
      loadingText={messages.states.loading}
      options={options}
      selectedId={selectedProfessionalId}
      onSelect={onSelect}
      isLoading={isLoading}
      noOptionsMessage="No hay profesionales disponibles"
      testId="professional-select"
    />
  );
};
