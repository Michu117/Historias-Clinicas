import React from 'react';
import { Select } from '../../../components/Select';

export interface SelectorOption {
  id: number;
  label: string;
  isActive?: boolean;
}

interface SelectorFieldProps {
  label: string;
  placeholder: string;
  options: SelectorOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
  loadingText?: string;
  noOptionsMessage?: string;
  testId?: string;
}

export const SelectorField: React.FC<SelectorFieldProps> = ({
  label,
  placeholder,
  options,
  selectedId,
  onSelect,
  isLoading,
  loadingText,
  noOptionsMessage,
  testId,
}) => {
  const activeOptions = options.filter((option) => option.isActive === true);
  const isDisabled = isLoading || activeOptions.length === 0;

  const selectOptions = activeOptions.map((opt) => ({ value: String(opt.id), label: opt.label }));

  return (
    <div>
      {isLoading ? <div>{loadingText ?? placeholder}</div> : null}
      <Select
        label={label}
        options={selectOptions}
        value={selectedId !== null ? String(selectedId) : ''}
        onChange={(e) => onSelect(Number((e.target as HTMLSelectElement).value))}
        disabled={isDisabled}
        data-testid={testId}
      />
      {!isLoading && activeOptions.length === 0 && noOptionsMessage ? <div>{noOptionsMessage}</div> : null}
    </div>
  );
};
