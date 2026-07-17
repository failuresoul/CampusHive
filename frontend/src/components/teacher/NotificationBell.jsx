import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Clock, ExternalLink, Inbox, RotateCcw } from 'lucide-react';

// TODO: Connect to GET /api/teachers/me/notifications in a future iteration, 
// or derive directly from the submission queue endpoint in Story 9.
const getMockNotifications = () => {
  const now = new Date();
  return [
    {
      id: 'sub-1',
      studentName: 'Tasnim Ahmed',
      course: 'CSE-3106: Software Engineering',
      submittedDate: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15m ago
    },
    {
      id: 'sub-2',
      studentName: 'Sadia Rahman',
      course: 'CSE-1201: Data Structures',
      submittedDate: new Date(now.getTime() - 90 * 60 * 1000).toISOString(), // 1.5h ago
    },
    {
      id: 'sub-3',
      studentName: 'Arafat Hossain',
      course: 'CSE-3106: Software Engineering',
      submittedDate: new Date(now.getTime() - 5 * 3600 * 1000).toISOString(), // 5h ago
    },
    {
      id: 'sub-4',
      studentName: 'Niaz Morshed',
      course: 'CSE-2203: Database Management Systems',
      submittedDate: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(), // 1d ago
    }
  ];
};

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

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(getMockNotifications());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  const badgeCount = notifications.length;

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  const handleReset = (e) => {
    e.stopPropagation();
    setNotifications(getMockNotifications());
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="teacher-notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label="View submissions notifications"
      >
        <Bell className="h-6 w-6" />
        {badgeCount > 0 && (
          <span 
            id="teacher-notification-badge"
            className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse"
          >
            {badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="teacher-notification-dropdown"
          className="absolute right-[-6.5rem] sm:right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden transition-all duration-300 animate-slide-up origin-top-right"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Submissions</h3>
              <p className="text-xs text-gray-500 font-medium">
                {badgeCount} pending {badgeCount === 1 ? 'submission' : 'submissions'}
              </p>
            </div>
            {badgeCount > 0 && (
              <button
                id="clear-all-notifications-btn"
                onClick={handleClearAll}
                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors px-2 py-1 hover:bg-red-50 rounded-lg"
              >
                Clear All
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {badgeCount > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="px-5 py-4 hover:bg-emerald-50/20 transition-colors duration-150 flex items-start gap-3 relative group"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {notification.studentName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      {notification.course}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-medium">
                        {formatRelativeTime(notification.submittedDate)}
                      </span>
                    </div>
                  </div>
                  {/* Dismiss Button */}
                  <button
                    onClick={(e) => handleDismiss(notification.id, e)}
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center" id="empty-notifications-state">
                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Inbox className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">No new submissions</p>
                <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                <button
                  id="reset-mock-notifications-btn"
                  onClick={handleReset}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Mock Data
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {badgeCount > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
              <Link
                to="/teacher/submissions"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all duration-200"
              >
                <span>View All Submission Queue</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
