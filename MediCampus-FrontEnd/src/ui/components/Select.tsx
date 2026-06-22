import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all appearance-none pr-8 ${className}`}
          style={{
            backgroundColor: 'var(--surface-container-low)',
            border: '1px solid var(--outline-variant)',
            color: 'var(--on-surface)',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
          {...props}
        >
          <option value="" disabled hidden>Seleccione una opción...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="fill-current h-4 w-4" style={{ color: 'var(--on-surface-variant)' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
