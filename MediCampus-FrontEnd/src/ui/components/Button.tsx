import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  const baseClasses = `rounded-global font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`;
  
  const variants = {
    primary: "bg-hc-primary hover:bg-hc-primaryHover text-hc-primaryText focus:ring-slate-500",
    secondary: "bg-hc-secondary hover:bg-hc-secondaryHover text-hc-secondaryText focus:ring-slate-300",
    tertiary: "bg-hc-tertiary hover:bg-hc-tertiaryHover text-hc-tertiaryText focus:ring-slate-200",
    danger: "bg-hc-danger hover:bg-hc-dangerHover text-hc-dangerText focus:ring-red-500",
    success: "bg-hc-success hover:bg-hc-successHover text-hc-successText focus:ring-green-500",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};