import React, { useState, useRef, useEffect } from 'react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationList } from './NotificationList';
import { INotification } from '../types';

interface NotificationBellProps {
  notifications: INotification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  error?: string;
  buttonClassName?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
  error,
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<INotification[]>(notifications);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotificationsList(notifications);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  const unreadCount = notificationsList.filter((n) => n.estado === 'no_leido').length;

  const handleMarkAsRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, estado: 'leido' as const } : notif
      )
    );
    onMarkAsRead(id);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        data-testid="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 text-slate-600 hover:text-slate-900 ${buttonClassName}`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && <NotificationBadge count={unreadCount} className="absolute -top-1 -right-1" />}
      </button>

      {isOpen && (
        <div
          data-testid="notification-bell-dropdown"
          className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto p-4"
        >
          <NotificationList
            notifications={notificationsList}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
            error={error}
          />
        </div>
      )}
    </div>
  );
};
