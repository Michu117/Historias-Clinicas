import React from 'react';

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${className}`}
      style={{
        backgroundColor: 'var(--surface-container-low)',
        border: '1px solid var(--outline-variant)',
        color: 'var(--on-surface)',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--outline-variant)'; }}
      {...props}
    />
  );
};
