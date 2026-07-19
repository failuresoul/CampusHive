import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  ClipboardList,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeacherSubmissions } from '../../services/labTrackService';
import SubmissionQueueTable from '../../components/teacher/SubmissionQueueTable';
import Pagination from '../../components/shared/Pagination';
import NotificationBell from '../../components/teacher/NotificationBell';

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Ungraded' },
  { value: 'graded',    label: 'Graded' },
  { value: 'all',       label: 'All' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/**
 * TeacherSubmissionQueuePage  — Story 9
 *
 * Shows a paginated, filterable queue of student lab report submissions
 * scoped to the logged-in teacher's assigned courses.
 *
 * Route: /teacher/submissions
 */
const TeacherSubmissionQueuePage = () => {
  const { token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter]   = useState('submitted');
  const [courseFilter, setCourseFilter]   = useState('');
  const [page, setPage]                   = useState(1);
  const [pageSize, setPageSize]           = useState(25);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [submissions, setSubmissions]     = useState([]);
  const [pagination, setPagination]       = useState({ page: 1, pageSize: 25, totalItems: 0, totalPages: 1 });
  const [courses, setCourses]             = useState([]);   // teacher's own courses for filter dropdown
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeacherSubmissions(
        { status: statusFilter, courseId: courseFilter, page, pageSize },
        token
      );
      setSubmissions(data.submissions);
      setPagination(data.pagination);
      // Only update the course list when it arrives (it's the same for all filter combos)
      if (data.courses && data.courses.length > 0) {
        setCourses(data.courses);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutContext();
        navigate('/login');
      } else {
        setError(err?.response?.data?.message ?? 'Failed to load submissions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, courseFilter, page, pageSize, navigate, logoutContext]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ── Filter handlers (reset page on filter change) ─────────────────────────
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleCourseChange = (val) => {
    setCourseFilter(val);
    setPage(1);
  };

  const handlePageSizeChange = (val) => {
    setPageSize(val);
    setPage(1);
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top Nav ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/teacher/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">CampusHive</span>
            </Link>
            <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              Teacher
            </span>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              id="teacher-queue-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Submission Queue
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">
            Lab report submissions from your courses — oldest ungraded first.
          </p>
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 whitespace-nowrap" htmlFor="status-filter">
                Status
              </label>
              <div className="relative">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Course filter */}
            {courses.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 whitespace-nowrap" htmlFor="course-filter">
                  Course
                </label>
                <div className="relative">
                  <select
                    id="course-filter"
                    value={courseFilter}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer transition-all"
                  >
                    <option value="">All my courses</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Spacer + refresh */}
            <div className="ml-auto flex items-center gap-3">
              {/* Counts summary */}
              {!loading && !error && (
                <span className="text-xs text-gray-400 font-medium">
                  {pagination.totalItems} result{pagination.totalItems !== 1 ? 's' : ''}
                </span>
              )}
              <button
                id="refresh-submissions-btn"
                onClick={() => fetchSubmissions()}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                aria-label="Refresh"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Error banner ────────────────────────────────────────────────────── */}
        {error && (
          <div
            id="submission-queue-error"
            className="mb-5 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => fetchSubmissions()}
              className="ml-auto text-xs font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Table ───────────────────────────────────────────────────────────── */}
        <SubmissionQueueTable
          submissions={submissions}
          loading={loading}
          statusFilter={statusFilter}
        />

        {/* ── Pagination ──────────────────────────────────────────────────────── */}
        {!loading && !error && pagination.totalItems > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            totalItems={pagination.totalItems}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>
    </div>
  );
};

export default TeacherSubmissionQueuePage;
