import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  LogOut,
  Bell,
  UserPlus,
  Upload,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import StudentTable from '../../components/admin/StudentTable';
import StudentFilters from '../../components/admin/StudentFilters';
import Pagination from '../../components/shared/Pagination';
import { getStudents } from '../../services/studentService';

import {
  DEPARTMENT_OPTIONS,
  BATCH_OPTIONS,
  STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../../mocks/students.mock';
// ↑ Only filter/option arrays are kept from the mock file.
// Mock student data is no longer used — the real API drives this page.

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SORT_KEY  = 'name';
const DEFAULT_SORT_DIR  = 'asc';
const SEARCH_DEBOUNCE_MS = 300; // avoids firing a request on every keystroke

// ─── Error Banner ──────────────────────────────────────────────────────────────

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 text-sm">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold">Failed to load students</p>
      <p className="text-xs text-red-600 mt-0.5">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs font-medium text-red-700 hover:text-red-900 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </button>
    )}
  </div>
);

// ─── Page ──────────────────────────────────────────────────────────────────────

/**
 * StudentListPage
 *
 * Route: /admin/students
 * Protected by ProtectedRoute (allowedRoles=['admin']) in App.jsx.
 *
 * Story 6: All filtering, sorting, and pagination is handled server-side via
 *   GET /api/students?search=&department=&batch=&status=&page=&pageSize=&sortBy=&sortOrder=
 *
 * The search input is debounced (300 ms) to avoid hammering the API on every
 * keystroke. All other controls (dropdowns, sort headers, page buttons) trigger
 * an immediate request.
 */
const StudentListPage = () => {
  const { user, token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // ── Filter / sort / pagination state ──────────────────────────────────────

  const [search, setSearch]           = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment]   = useState('');
  const [batch, setBatch]             = useState('');
  const [status, setStatus]           = useState('');
  const [sortKey, setSortKey]         = useState(DEFAULT_SORT_KEY);
  const [sortDir, setSortDir]         = useState(DEFAULT_SORT_DIR);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(PAGE_SIZE_OPTIONS[0]);

  // ── API response state ────────────────────────────────────────────────────

  const [students, setStudents]       = useState([]);
  const [pagination, setPagination]   = useState({
    page: 1, pageSize: PAGE_SIZE_OPTIONS[0], totalItems: 0, totalPages: 1,
  });
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);

  // ── Debounce the search input ─────────────────────────────────────────────

  const debounceTimer = useRef(null);
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset to page 1 on new search
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // ── Fetch from API whenever any query param changes ───────────────────────

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getStudents(
        {
          search:    debouncedSearch,
          department,
          batch,
          status,
          page:      currentPage,
          pageSize,
          sortBy:    sortKey,
          sortOrder: sortDir,
        },
        token
      );
      setStudents(result.students);
      setPagination(result.pagination);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred.';
      setError(msg);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, department, batch, status, currentPage, pageSize, sortKey, sortDir, token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((patch) => {
    // Search is handled separately via debounce
    if ('search' in patch) {
      setSearch(patch.search);
      // debouncedSearch + currentPage reset happen in the debounce useEffect
      return;
    }
    if ('department' in patch) setDepartment(patch.department);
    if ('batch' in patch)      setBatch(patch.batch);
    if ('status' in patch)     setStatus(patch.status);
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setBatch('');
    setStatus('');
    setCurrentPage(1);
    clearTimeout(debounceTimer.current);
  }, []);

  const handleSort = useCallback(
    (key) => {
      if (key === sortKey) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortDir('asc');
      }
      setCurrentPage(1);
    },
    [sortKey]
  );

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const hasActiveFilters = !!(search || department || batch || status);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">
              CampusHive
            </span>
            <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Admin
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifications"
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              id="student-list-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li className="text-gray-800 font-semibold" aria-current="page">
              Students
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Students
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage and search all registered students
              </p>
            </div>
          </div>

          {/* Quick-action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/admin/students/import"
              id="student-list-import-btn"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
            </Link>
            <Link
              to="/admin/students/add"
              id="student-list-add-btn"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Student</span>
            </Link>
          </div>
        </div>

        {/* ── Filter Panel ──────────────────────────────────────────────── */}
        <div className="mb-4">
          <StudentFilters
            search={search}
            department={department}
            batch={batch}
            status={status}
            departmentOptions={DEPARTMENT_OPTIONS}
            batchOptions={BATCH_OPTIONS}
            statusOptions={STATUS_OPTIONS}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalFiltered={pagination.totalItems}
            totalAll={pagination.totalItems}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onRetry={fetchStudents} />
          </div>
        )}

        {/* Results summary */}
        {!isLoading && !error && (
          <p className="mb-3 text-xs text-gray-400 px-1">
            {hasActiveFilters ? (
              <>
                <span className="font-semibold text-gray-600">{pagination.totalItems}</span>{' '}
                student{pagination.totalItems !== 1 ? 's' : ''} match your filters
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-600">{pagination.totalItems}</span>{' '}
                student{pagination.totalItems !== 1 ? 's' : ''} total
              </>
            )}
          </p>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <StudentTable
          students={students}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          hasFilters={hasActiveFilters}
        />

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!isLoading && !error && pagination.totalItems > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            totalItems={pagination.totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>
    </div>
  );
};

export default StudentListPage;
