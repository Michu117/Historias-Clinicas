import React from 'react';
import { Servicio } from '../../types';
import { SelectorField } from '../shared/SelectorField';
import { messages } from '../../utils/constants/messages';

interface ServiceSelectorProps {
  servicios: Servicio[];
  selectedServiceId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({ servicios, selectedServiceId, onSelect, isLoading }) => {
  const options = servicios.map((servicio) => ({
    id: servicio.id,
    label: servicio.nombre,
    isActive: servicio.es_activo === true,
  }));

  return (
    <SelectorField
      label="Selecciona un servicio"
      placeholder={messages.placeholders.selectService}
      loadingText={messages.states.loading}
      options={options}
      selectedId={selectedServiceId}
      onSelect={onSelect}
      isLoading={isLoading}
      testId="service-select"
    />
  );
};
