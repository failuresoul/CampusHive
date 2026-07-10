import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

/**
 * StudentFilters
 *
 * Search bar + Department / Batch / Status filter controls.
 * Fully controlled — all state lives in StudentListPage.
 *
 * Props:
 *   search         – current search string
 *   department     – selected department value ('' = all)
 *   batch          – selected batch value ('' = all)
 *   status         – selected status value ('' = all)
 *   departmentOptions – [{ value, label }]
 *   batchOptions      – [{ value, label }]
 *   statusOptions     – [{ value, label }]
 *   onChange       – ({ search?, department?, batch?, status? }) => void
 *   onReset        – () => void
 *   totalFiltered  – number of results currently matching (for display)
 */
const StudentFilters = ({
  search,
  department,
  batch,
  status,
  departmentOptions,
  batchOptions,
  statusOptions,
  onChange,
  onReset,
  totalFiltered,
  totalAll,
}) => {
  const hasActiveFilters = search || department || batch || status;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-gray-700">
          <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
          <span className="text-sm font-semibold">Filter Students</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              {totalFiltered} / {totalAll}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            id="student-filters-reset-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
            aria-label="Clear all filters"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
        <input
          id="student-search-input"
          type="search"
          value={search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search by name, email, or roll number…"
          aria-label="Search students"
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:bg-white transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => onChange({ search: '' })}
            aria-label="Clear search"
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown filters row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Department */}
        <div className="relative">
          <label
            htmlFor="filter-department"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Department
          </label>
          <select
            id="filter-department"
            value={department}
            onChange={(e) => onChange({ department: e.target.value })}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer transition-all duration-200 appearance-none ${
              department
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200'
            }`}
            aria-label="Filter by department"
          >
            {departmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute bottom-2.5 right-3 text-gray-400">
            ▾
          </span>
        </div>

        {/* Batch */}
        <div className="relative">
          <label
            htmlFor="filter-batch"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Batch
          </label>
          <select
            id="filter-batch"
            value={batch}
            onChange={(e) => onChange({ batch: e.target.value })}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer transition-all duration-200 appearance-none ${
              batch
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200'
            }`}
            aria-label="Filter by batch"
          >
            {batchOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute bottom-2.5 right-3 text-gray-400">
            ▾
          </span>
        </div>

        {/* Status */}
        <div className="relative">
          <label
            htmlFor="filter-status"
            className="block text-xs font-medium text-gray-500 mb-1"
          >
            Status
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer transition-all duration-200 appearance-none ${
              status
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium'
                : 'border-gray-200'
            }`}
            aria-label="Filter by status"
          >
            {statusOptions.map((opt) => (
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
  );
};

export default StudentFilters;
