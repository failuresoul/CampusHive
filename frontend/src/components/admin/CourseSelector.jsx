import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ChevronDown } from 'lucide-react';

/**
 * CourseSelector
 *
 * A searchable autocomplete dropdown component to select a course.
 *
 * Props:
 *   courses      - Array of course objects [{ id, code, title, department, ... }]
 *   selectedId   - The id of the currently selected course
 *   onSelect     - Callback when a course is chosen: (course) => void
 *   error        - Validation error string (optional)
 */
const CourseSelector = ({ courses = [], selectedId, onSelect, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const selectedCourse = courses.find((c) => c.id === selectedId);

  // Filter courses based on code or title match
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      course.code.toLowerCase().includes(query) ||
      course.title.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query)
    );
  });

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When selected course changes, reset the local input display search text
  useEffect(() => {
    if (selectedCourse) {
      setSearchQuery('');
    }
  }, [selectedId, selectedCourse]);

  const handleSelect = (course) => {
    onSelect(course);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <label
        htmlFor="course-selector-input"
        className="block text-sm font-semibold text-gray-700 mb-1.5"
      >
        Select Course <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
          <BookOpen className="h-4 w-4" />
        </span>

        <input
          id="course-selector-input"
          type="text"
          className={`input-field pl-10 pr-20 py-2.5 text-sm bg-white border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 cursor-pointer ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
          }`}
          placeholder={selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Search by course code or title...'}
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          autoComplete="off"
        />

        {/* Action Buttons inside Input */}
        <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
          {selectedCourse && (
            <button
              type="button"
              onClick={handleClear}
              id="course-selector-clear"
              aria-label="Clear selected course"
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            id="course-selector-toggle"
            aria-label="Toggle courses list"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 animate-fade-in" id="course-selector-error" role="alert">
          {error}
        </p>
      )}

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          id="course-selector-dropdown"
          className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-slide-up focus:outline-none"
          role="listbox"
        >
          {filteredCourses.length > 0 ? (
            <ul className="py-1">
              {filteredCourses.map((course) => {
                const isSelected = selectedId === course.id;
                return (
                  <li
                    key={course.id}
                    id={`course-option-${course.id}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(course)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-900 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600">{course.code}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
                          {course.department}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-normal mt-0.5">{course.title}</div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-indigo-600">Selected</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No matching courses found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSelector;
