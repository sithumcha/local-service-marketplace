import React, { useState, useEffect, useRef } from 'react';
import useNotificationStore from '../store/useNotificationStore';
import useAuthStore from '../store/useAuthStore';

const NotificationBell = () => {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (n) => {
    if (!n.read) {
      await markAsRead(n._id);
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition cursor-pointer"
        aria-label="Notifications"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl z-50 backdrop-blur-lg overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Alert Center</h4>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[10px] font-black text-amber-500 hover:text-amber-400 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications feed */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-850">
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 hover:bg-slate-850/50 transition cursor-pointer flex gap-3 items-start ${
                  !n.read ? 'bg-amber-500/[0.02]' : ''
                }`}
              >
                {/* Type icon indicator */}
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  n.type === 'booking'
                    ? 'bg-amber-500/10 text-amber-500'
                    : n.type === 'chat'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {n.type === 'booking' ? (
                    <span className="text-xs">🛠</span>
                  ) : n.type === 'chat' ? (
                    <span className="text-xs">💬</span>
                  ) : (
                    <span className="text-xs">🔔</span>
                  )}
                </div>

                {/* Message body */}
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-xs block ${!n.read ? 'font-black text-white' : 'font-bold text-slate-300'}`}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{n.message}</p>
                  <span className="text-[9px] text-slate-500 block mt-1 font-semibold">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-[11px] space-y-2">
                <span className="text-2xl block">🔔</span>
                <p className="font-bold text-slate-400">All caught up!</p>
                <p className="text-slate-600 text-[10px]">No notification alerts available.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
