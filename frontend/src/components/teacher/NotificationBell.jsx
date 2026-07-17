import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, Clock, ExternalLink, Inbox, Loader2 } from 'lucide-react';
import { getTeacherSubmissions } from '../../services/labTrackService';
import { useAuth } from '../../context/AuthContext';

/**
 * TeacherNotificationBell — Story 7 updated by Story 9
 *
 * Now sources its badge count and notification list from the real
 * GET /api/teachers/me/submissions?status=submitted endpoint instead of
 * mock data.  Polls every 30 s so the count stays fresh.
 *
 * Unread state is tracked locally (per session) since the teacher's submission
 * queue doesn't have per-notification isRead; the badge clears once the
 * dropdown is opened.
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

const NotificationBell = () => {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seenCount, setSeenCount] = useState(0);  // count seen when dropdown was last opened
  const dropdownRef = useRef(null);

  // ── Fetch ungraded submissions (pageSize=10 is enough for the bell preview) ──
  const fetchUngraded = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getTeacherSubmissions(
        { status: 'submitted', page: 1, pageSize: 10 },
        token
      );
      setSubmissions(data.submissions ?? []);
    } catch {
      // Silently swallow errors in the bell — the queue page will surface them
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUngraded();
    const interval = setInterval(fetchUngraded, 30_000);
    return () => clearInterval(interval);
  }, [fetchUngraded]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Open dropdown → mark current count as seen ──────────────────────────
  const handleToggle = () => {
    if (!isOpen) {
      // Opening: mark all currently loaded as seen
      setSeenCount(submissions.length);
    }
    setIsOpen((prev) => !prev);
  };

  const badgeCount = Math.max(0, submissions.length - seenCount);

  const handleDismissLocal = (id, e) => {
    e.stopPropagation();
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="teacher-notification-bell-btn"
        onClick={handleToggle}
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
          className="absolute right-[-6.5rem] sm:right-0 mt-3 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: 'slideDown 0.15s ease-out' }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Submissions</h3>
              <p className="text-xs text-gray-500 font-medium">
                {loading
                  ? 'Loading…'
                  : `${submissions.length} pending ${submissions.length === 1 ? 'submission' : 'submissions'}`}
              </p>
            </div>
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : submissions.length > 0 ? (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="px-5 py-4 hover:bg-emerald-50/20 transition-colors duration-150 flex items-start gap-3 relative group"
                >
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {sub.studentName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      {sub.courseCode} — {sub.title || sub.originalFileName || 'Lab Report'}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-medium">
                        {formatRelativeTime(sub.submittedAt)}
                      </span>
                    </div>
                  </div>
                  {/* Local dismiss */}
                  <button
                    onClick={(e) => handleDismissLocal(sub.id, e)}
                    className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                    aria-label="Dismiss"
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
              </div>
            )}
          </div>

          {/* Footer */}
          {submissions.length > 0 && (
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

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
