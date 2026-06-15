import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-global shadow-sm p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};