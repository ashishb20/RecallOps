import { useState, useEffect, useRef } from 'react';

const NOTIFICATION_API_URL = import.meta.env.VITE_NOTIFICATION_API_URL || 'http://localhost:8085';

const NotificationBell = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Poll unread count every 30s
  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${NOTIFICATION_API_URL}/api/v1/notifications/unread-count?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch {
        // Notification service offline: ignore silently
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Fetch feed when dropdown opens
  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${NOTIFICATION_API_URL}/api/v1/notifications/in-app?userId=${userId}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [isOpen, userId]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${NOTIFICATION_API_URL}/api/v1/notifications/${id}/read?userId=${userId}`, {
        method: 'PUT',
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-teal-600 font-medium">{unreadCount} unread</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3 text-sm transition-colors cursor-pointer ${
                    n.isRead ? 'bg-white text-gray-600' : 'bg-teal-50/50 text-gray-900 font-medium'
                  } hover:bg-gray-50`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-gray-900 text-xs">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
