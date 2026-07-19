import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Inbox,
} from 'lucide-react';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelative = (dateString) => {
  if (!dateString) return '';
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

const StatusBadge = ({ status }) => {
  if (status === 'graded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 className="h-3 w-3" />
        Graded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
};

/**
 * SubmissionQueueTable
 *
 * Props:
 *   submissions  – array from API
 *   loading      – boolean
 *   statusFilter – current status filter (for context in empty state)
 */
const SubmissionQueueTable = ({ submissions = [], loading = false, statusFilter = 'submitted' }) => {
  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
              <div className="h-9 w-9 bg-gray-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-8 w-16 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (submissions.length === 0) {
    const emptyMessages = {
      submitted: { title: 'No pending submissions', sub: 'All caught up! No ungraded work in your queue.' },
      graded:    { title: 'No graded submissions', sub: 'Graded submissions will appear here.' },
      all:       { title: 'No submissions yet', sub: 'Once students submit lab reports, they will appear here.' },
    };
    const msg = emptyMessages[statusFilter] ?? emptyMessages.all;

    return (
      <div
        id="submission-queue-empty-state"
        className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center"
      >
        <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Inbox className="h-7 w-7 text-gray-300" />
        </div>
        <p className="text-base font-semibold text-gray-700">{msg.title}</p>
        <p className="text-sm text-gray-400 mt-1">{msg.sub}</p>
      </div>
    );
  }

  // ── Table ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Student
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Course
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Title
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Submitted
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map((sub) => (
              <tr
                key={sub.id}
                id={`submission-row-${sub.id}`}
                className="hover:bg-gray-50/60 transition-colors duration-100 group"
              >
                {/* Student */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-bold text-xs">
                        {sub.studentName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {sub.studentName}
                      </p>
                      {sub.rollNumber && sub.rollNumber !== '—' && (
                        <p className="text-xs text-gray-400 mt-0.5">{sub.rollNumber}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Course */}
                <td className="px-4 py-4">
                  <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
                    {sub.courseCode}
                  </span>
                </td>

                {/* Title */}
                <td className="px-4 py-4 max-w-[200px]">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                    <span className="text-gray-700 truncate text-sm" title={sub.title}>
                      {sub.title || sub.originalFileName || 'Lab Report'}
                    </span>
                  </div>
                </td>

                {/* Submitted */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-700">{formatDate(sub.submittedAt)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelative(sub.submittedAt)}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge status={sub.status} />
                  {sub.status === 'graded' && sub.grade && (
                    <p className="text-xs text-gray-500 mt-1">Grade: <span className="font-semibold">{sub.grade}</span></p>
                  )}
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/teacher/submissions/${sub.id}/grade`}
                    id={`grade-btn-${sub.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150
                      bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md group-hover:scale-[1.02]"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    {sub.status === 'graded' ? 'Review' : 'Grade'}
                    <ChevronRight className="h-3 w-3 opacity-70" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-gray-50">
        {submissions.map((sub) => (
          <div key={sub.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {sub.studentName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{sub.studentName}</p>
                  <p className="text-xs text-gray-400">{sub.courseCode}</p>
                </div>
              </div>
              <StatusBadge status={sub.status} />
            </div>

            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              <span className="truncate">{sub.title || sub.originalFileName || 'Lab Report'}</span>
            </p>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{formatRelative(sub.submittedAt)}</p>
              <Link
                to={`/teacher/submissions/${sub.id}/grade`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <ClipboardCheck className="h-3 w-3" />
                {sub.status === 'graded' ? 'Review' : 'Grade'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubmissionQueueTable;
