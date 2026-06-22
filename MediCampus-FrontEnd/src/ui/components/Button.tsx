import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const variants: Record<string, React.CSSProperties> = {
  primary: { backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' },
  secondary: { backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' },
  tertiary: { backgroundColor: 'var(--btn-tertiary-bg)', color: 'var(--btn-tertiary-text)' },
  danger: { backgroundColor: 'var(--btn-danger-bg)', color: 'var(--btn-danger-text)' },
  success: { backgroundColor: 'var(--btn-success-bg)', color: 'var(--btn-success-text)' },
};

const sizeClasses = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  return (
    <button
      className={`rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      style={variants[variant]}
      onMouseEnter={(e) => {
        const hoverMap: Record<string, string> = {
          primary: 'var(--btn-primary-hover)',
          secondary: 'var(--btn-secondary-hover)',
          tertiary: 'var(--btn-tertiary-hover)',
          danger: 'var(--btn-danger-hover)',
          success: 'var(--btn-success-hover)',
        };
        e.currentTarget.style.backgroundColor = hoverMap[variant];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = variants[variant].backgroundColor as string;
      }}
      {...props}
    >
      {children}
    </button>
  );
};
