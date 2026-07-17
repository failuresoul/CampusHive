import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Clock, CheckCheck, Inbox, Loader2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';

/**
 * StudentNotificationBell — Story 8
 *
 * Fetches grade notifications from GET /api/students/me/notifications on mount
 * and on a 30-second polling interval.  Each notification can be marked as
 * read individually (PATCH …/:id/read), and the unread badge reflects the
 * true isRead status from the server.
 */

const formatRelativeTime = (dateString) => {
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

const StudentNotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // ── Fetch notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      // Silently suppress 401/403 — user may not be logged in yet
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        setError('Could not load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new grade notifications
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: updated.isRead } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) =>
        notificationService.markAsRead(n.id).catch(() => null)
      )
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="student-notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label="View grade notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span
            id="student-notification-badge"
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="student-notification-dropdown"
          className="absolute right-[-6.5rem] sm:right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: 'slideDown 0.15s ease-out' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Grade Notifications
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                id="student-mark-all-read-btn"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors px-2 py-1 hover:bg-amber-50 rounded-lg"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : error ? (
              <div className="px-5 py-6 text-center text-sm text-red-500" id="notification-error-state">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-8 text-center" id="student-empty-notifications-state">
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Inbox className="h-6 w-6 text-amber-300" />
                </div>
                <p className="text-sm font-semibold text-gray-900">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll be notified when a submission is graded.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-5 py-4 transition-colors duration-150 flex items-start gap-3 relative group ${
                    notification.isRead
                      ? 'bg-white hover:bg-gray-50/60'
                      : 'bg-amber-50/30 hover:bg-amber-50/60'
                  }`}
                >
                  {/* Unread dot */}
                  <div
                    className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.isRead ? 'bg-gray-200' : 'bg-amber-500'
                    }`}
                  />

                  <div className="flex-1 min-w-0 pr-8">
                    <p
                      className={`text-sm font-medium ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-900 font-semibold'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-medium">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Mark-as-read button — only shown for unread items */}
                  {!notification.isRead && (
                    <button
                      id={`mark-read-btn-${notification.id}`}
                      onClick={(e) => handleMarkRead(notification.id, e)}
                      className="absolute right-3 top-4 text-gray-400 hover:text-amber-600 p-1 hover:bg-amber-50 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                      aria-label="Mark as read"
                      title="Mark as read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && !loading && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 text-center">
              <p className="text-[11px] text-gray-400 font-medium">
                Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StudentNotificationBell;
