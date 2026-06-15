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
    primary: "bg-[#0056b3] hover:bg-[#003f87] text-white focus:ring-blue-500",
    secondary: "bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] focus:ring-slate-300",
    tertiary: "bg-transparent hover:bg-[#f1f5f9] text-[#475569] focus:ring-slate-200",
    danger: "bg-[#ef4444] hover:bg-[#dc2626] text-white focus:ring-red-500",
    success: "bg-[#22c55e] hover:bg-[#16a34a] text-white focus:ring-green-500",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};