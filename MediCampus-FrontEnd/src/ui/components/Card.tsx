import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`bg-white border border-[#c2c6d4] rounded-xl shadow-sm p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className = '', children, ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-[#141b2b] leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
};