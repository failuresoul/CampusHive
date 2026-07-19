import React from 'react';
import {
  Eye,
  UserX,
  UserCheck,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { DEPARTMENT_LABELS } from '../../mocks/students.mock';

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'name',       label: 'Name',        sortable: true,  minWidth: 'min-w-[150px]' },
  { key: 'email',      label: 'Email',       sortable: false, minWidth: 'min-w-[200px]' },
  { key: 'department', label: 'Department',  sortable: true,  minWidth: 'min-w-[160px]' },
  { key: 'designation',label: 'Designation', sortable: true,  minWidth: 'min-w-[150px]' },
  { key: 'phone',      label: 'Phone',       sortable: false, minWidth: 'min-w-[130px]' },
  { key: 'status',     label: 'Status',      sortable: false, minWidth: 'min-w-[90px]'  },
  { key: 'actions',    label: 'Actions',     sortable: false, minWidth: 'min-w-[120px]' },
];

const SortIcon = ({ columnKey, sortKey, sortDir }) => {
  if (columnKey !== sortKey)
    return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300 ml-1 flex-shrink-0" />;
  return sortDir === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 text-indigo-500 ml-1 flex-shrink-0" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-indigo-500 ml-1 flex-shrink-0" />
  );
};

// ── Skeleton row ──────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {COLUMNS.map((col) => (
      <td key={col.key} className="px-4 py-3.5">
        <div
          className={`h-4 bg-gray-200 rounded-full ${
            col.key === 'actions' ? 'w-20' : col.key === 'status' ? 'w-14' : 'w-full'
          }`}
        />
      </td>
    ))}
  </tr>
);

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ hasFilters }) => (
  <tr>
    <td colSpan={COLUMNS.length} className="py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
          {hasFilters ? '🔍' : '👥'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {hasFilters ? 'No teachers match your filters' : 'No teachers yet'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {hasFilters
              ? 'Try adjusting the search or filter criteria'
              : 'Teachers will appear here once added'}
          </p>
        </div>
      </div>
    </td>
  </tr>
);

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${
      status === 'active'
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
    }`}
  >
    {status === 'active' ? (
      <UserCheck className="h-3 w-3" aria-hidden="true" />
    ) : (
      <UserX className="h-3 w-3" aria-hidden="true" />
    )}
    {status === 'active' ? 'Active' : 'Inactive'}
  </span>
);

/**
 * TeacherTable
 *
 * Renders a data table of teachers.
 *
 * Props:
 *   teachers   – page-sliced array of teacher objects
 *   isLoading  – show skeleton rows
 *   hasFilters – true when any filter/search is active (affects empty-state copy)
 */
const TeacherTable = ({ teachers, isLoading, sortKey, sortDir, onSort, hasFilters }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full border-collapse text-sm" aria-label="Teacher list">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${col.minWidth} ${
                  col.sortable
                    ? 'cursor-pointer select-none hover:bg-gray-100 hover:text-indigo-700 transition-colors group'
                    : ''
                }`}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
                aria-sort={
                  col.sortable && col.key === sortKey
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable
                    ? 'none'
                    : undefined
                }
              >
                <span className="flex items-center">
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      columnKey={col.key}
                      sortKey={sortKey}
                      sortDir={sortDir}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 bg-white">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : teachers.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            teachers.map((teacher) => (
              <tr
                key={teacher.id}
                className="hover:bg-indigo-50/40 transition-colors duration-100 group"
              >
                {/* Name */}
                <td className="px-4 py-3.5">
                  <span className="font-medium text-gray-900 whitespace-nowrap">
                    {teacher.name}
                  </span>
                </td>

                {/* Email */}
                <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                  {teacher.email}
                </td>

                {/* Department */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium ring-1 ring-violet-200">
                    {teacher.department}
                  </span>
                  <span className="ml-2 text-xs text-gray-400 hidden lg:inline">
                    {DEPARTMENT_LABELS[teacher.department] ?? ''}
                  </span>
                </td>

                {/* Designation */}
                <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap font-medium">
                  {teacher.designation}
                </td>

                {/* Phone */}
                <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap font-mono text-xs">
                  {teacher.phone || '—'}
                </td>

                {/* Status */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={teacher.status} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    {/* View — placeholder */}
                    <button
                      id={`teacher-view-btn-${teacher.id}`}
                      aria-label={`View ${teacher.name}`}
                      title="View teacher"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      onClick={() => {
                        /* Placeholder action */
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Deactivate — placeholder */}
                    <button
                      id={`teacher-deactivate-btn-${teacher.id}`}
                      aria-label={`Deactivate ${teacher.name}`}
                      title={teacher.status === 'active' ? 'Deactivate teacher' : 'Activate teacher'}
                      className={`p-1.5 rounded-lg text-gray-400 transition-colors focus:outline-none focus:ring-2 ${
                        teacher.status === 'active'
                          ? 'hover:text-red-600 hover:bg-red-50 focus:ring-red-300'
                          : 'hover:text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-300'
                      }`}
                      onClick={() => {
                        /* Placeholder action */
                      }}
                    >
                      {teacher.status === 'active' ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherTable;
