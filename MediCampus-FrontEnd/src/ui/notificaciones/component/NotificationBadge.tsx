import React from 'react';

interface NotificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = '', ...props }) => {
  if (count === 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full ${className}`}
      aria-label={`${count} notificaciones`}
      {...props}
    >
      {count}
    </span>
  );
};
