import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination
 *
 * Shared, reusable pagination component.
 *
 * Props:
 *   currentPage   – 1-indexed current page number
 *   totalPages    – total number of pages
 *   pageSize      – items per page (current selection)
 *   pageSizeOptions – array of numbers, e.g. [10, 25, 50]
 *   totalItems    – total record count (for display)
 *   onPageChange  – (newPage: number) => void
 *   onPageSizeChange – (newSize: number) => void
 */
const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 25, 50],
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  // First / last visible item numbers
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  // Build a sensible page window: always show first, last, current ± 1, with ellipsis
  const buildPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, currentPage]);
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);

    const sorted = Array.from(pages).sort((a, b) => a - b);
    const result = [];
    sorted.forEach((p, i) => {
      if (i > 0 && sorted[i - 1] !== p - 1) result.push('...');
      result.push(p);
    });
    return result;
  };

  const pageNumbers = buildPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
      {/* Left: item range + page size selector */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>
          Showing{' '}
          <span className="font-semibold text-gray-700">{firstItem}–{lastItem}</span>{' '}
          of{' '}
          <span className="font-semibold text-gray-700">{totalItems}</span>{' '}
          students
        </span>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-xs text-gray-400 whitespace-nowrap">
            Per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer transition-colors"
            aria-label="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page number buttons */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {/* Prev */}
          <button
            id="pagination-prev-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1.5 text-gray-400 text-sm select-none"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                id={`pagination-page-${p}-btn`}
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  p === currentPage
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            id="pagination-next-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
