import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import StudentTable from '../../components/admin/StudentTable';
import StudentFilters from '../../components/admin/StudentFilters';
import Pagination from '../../components/shared/Pagination';

import {
  MOCK_STUDENTS,
  DEPARTMENT_OPTIONS,
  BATCH_OPTIONS,
  STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
} from '../../mocks/students.mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SORT_KEY = 'name';
const DEFAULT_SORT_DIR = 'asc';
const LOADING_DELAY_MS = 600; // simulates async fetch for skeleton demo

// ─── Client-side filter / sort / paginate helpers ─────────────────────────────

/**
 * applyFilters
 * Filters the full student list against search text + dropdown filters.
 */
function applyFilters(students, { search, department, batch, status }) {
  const q = search.trim().toLowerCase();
  return students.filter((s) => {
    if (
      q &&
      !s.name.toLowerCase().includes(q) &&
      !s.email.toLowerCase().includes(q) &&
      !s.rollNumber.toLowerCase().includes(q)
    )
      return false;
    if (department && s.department !== department) return false;
    if (batch && s.batch !== batch) return false;
    if (status && s.status !== status) return false;
    return true;
  });
}

/**
 * applySort
 * Sorts an array of students by a key in a given direction.
 */
function applySort(students, key, dir) {
  return [...students].sort((a, b) => {
    const aVal = (a[key] ?? '').toString().toLowerCase();
    const bVal = (b[key] ?? '').toString().toLowerCase();
    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * StudentListPage
 *
 * Route: /admin/students
 * Protected by ProtectedRoute (allowedRoles=['admin']) in App.jsx.
 *
 * Story 5 — UI only.  Search, filter, sort, and pagination are handled
 * fully client-side against MOCK_STUDENTS.
 *
 * TODO (Story 6): Replace mock data fetch with a real API call:
 *   GET /api/students?search=&department=&batch=&status=&page=&sort=&sortDir=
 * Remove the MOCK_STUDENTS import and the applyFilters / applySort helpers
 * once the API handles them server-side.
 */
const StudentListPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  // ── UI state ──────────────────────────────────────────────────────────────

  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [department, setDepartment]   = useState('');
  const [batch, setBatch]             = useState('');
  const [status, setStatus]           = useState('');
  const [sortKey, setSortKey]         = useState(DEFAULT_SORT_KEY);
  const [sortDir, setSortDir]         = useState(DEFAULT_SORT_DIR);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(PAGE_SIZE_OPTIONS[0]);

  // ── Simulate initial data loading (skeleton) ──────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredAndSorted = useMemo(() => {
    const filtered = applyFilters(MOCK_STUDENTS, { search, department, batch, status });
    return applySort(filtered, sortKey, sortDir);
  }, [search, department, batch, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));

  const currentPageStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback((patch) => {
    if ('search' in patch)     setSearch(patch.search);
    if ('department' in patch) setDepartment(patch.department);
    if ('batch' in patch)      setBatch(patch.batch);
    if ('status' in patch)     setStatus(patch.status);
    setCurrentPage(1); // reset to first page on any filter change
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setDepartment('');
    setBatch('');
    setStatus('');
    setCurrentPage(1);
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
            totalFiltered={filteredAndSorted.length}
            totalAll={MOCK_STUDENTS.length}
          />
        </div>

        {/* Results summary */}
        {!isLoading && (
          <p className="mb-3 text-xs text-gray-400 px-1">
            {hasActiveFilters ? (
              <>
                <span className="font-semibold text-gray-600">{filteredAndSorted.length}</span>{' '}
                of {MOCK_STUDENTS.length} students match your filters
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-600">{MOCK_STUDENTS.length}</span>{' '}
                students total
              </>
            )}
            {/* TODO (Story 6): replace with server-side count from API */}
          </p>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <StudentTable
          students={currentPageStudents}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          hasFilters={hasActiveFilters}
        />

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!isLoading && filteredAndSorted.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            totalItems={filteredAndSorted.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </main>
    </div>
  );
};

export default StudentListPage;
