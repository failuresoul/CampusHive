import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  LogOut,
  Bell,
  UserPlus,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Search,
  X,
  SlidersHorizontal,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import TeacherTable from '../../components/admin/TeacherTable';
import Pagination from '../../components/shared/Pagination';
import { getTeachers } from '../../services/teacherService';
import { DEPARTMENT_OPTIONS, PAGE_SIZE_OPTIONS } from '../../mocks/students.mock';

// ─── Constants ────────────────────────────────────────────────────────────────

const SEARCH_DEBOUNCE_MS = 300;

// ─── Error Banner ──────────────────────────────────────────────────────────────

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800 text-sm">
    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold">Failed to load teachers</p>
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

const TeacherListPage = () => {
  const { token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // ── Filter / pagination state ──────────────────────────────────────

  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [department, setDepartment]           = useState('');
  const [sortKey, setSortKey]                 = useState('name');
  const [sortDir, setSortDir]                 = useState('asc');
  const [currentPage, setCurrentPage]         = useState(1);
  const [pageSize, setPageSize]               = useState(PAGE_SIZE_OPTIONS[0]);

  // ── API response state ────────────────────────────────────────────────────

  const [teachers, setTeachers]               = useState([]);
  const [pagination, setPagination]           = useState({
    page: 1, pageSize: PAGE_SIZE_OPTIONS[0], totalItems: 0, totalPages: 1,
  });
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState(null);

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

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTeachers(
        {
          search:    debouncedSearch,
          department,
          page:      currentPage,
          pageSize,
          sortBy:    sortKey,
          sortOrder: sortDir,
        },
        token
      );
      setTeachers(result.teachers);
      setPagination(result.pagination);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred.';
      setError(msg);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, department, currentPage, pageSize, sortKey, sortDir, token]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleDepartmentChange = (val) => {
    setDepartment(val);
    setCurrentPage(1);
  };

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

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDepartment('');
    setCurrentPage(1);
    clearTimeout(debounceTimer.current);
  };

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

  const hasActiveFilters = !!(search || department);

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
              id="teacher-list-logout-btn"
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
              Teachers
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
                Teachers
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Manage and search all registered teachers
              </p>
            </div>
          </div>

          {/* Quick-action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/admin/teachers/add"
              id="teacher-list-add-btn"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Register Teacher</span>
            </Link>
          </div>
        </div>

        {/* ── Filter Panel ──────────────────────────────────────────────── */}
        <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-semibold">Filter Teachers</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {pagination.totalItems} / {pagination.totalItems}
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                id="teacher-filters-reset-btn"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                aria-label="Clear all filters"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-3">
              <Search
                className="pointer-events-none absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="teacher-search-input"
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name or email…"
                aria-label="Search teachers"
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Department Select */}
            <div className="relative">
              <select
                id="filter-department"
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer transition-all duration-200 appearance-none ${
                  department
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                    : 'border-gray-200'
                }`}
                aria-label="Filter by department"
              >
                {DEPARTMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute bottom-2.5 right-3 text-gray-400">
                ▾
              </span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onRetry={fetchTeachers} />
          </div>
        )}

        {/* Results summary */}
        {!isLoading && !error && (
          <p className="mb-3 text-xs text-gray-400 px-1">
            {hasActiveFilters ? (
              <>
                <span className="font-semibold text-gray-600">{pagination.totalItems}</span>{' '}
                teacher{pagination.totalItems !== 1 ? 's' : ''} match your filters
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-600">{pagination.totalItems}</span>{' '}
                teacher{pagination.totalItems !== 1 ? 's' : ''} total
              </>
            )}
          </p>
        )}

        {/* ── Table ─────────────────────────────────────────────────────── */}
        <TeacherTable
          teachers={teachers}
          isLoading={isLoading}
          hasFilters={hasActiveFilters}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
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

export default TeacherListPage;
