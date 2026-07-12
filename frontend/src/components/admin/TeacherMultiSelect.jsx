import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ChevronDown, UserCheck } from 'lucide-react';

/**
 * TeacherMultiSelect
 *
 * A searchable multi-select dropdown component for selecting teachers.
 *
 * Props:
 *   teachers           - Array of all teacher objects [{ id, name, email, department, designation }]
 *   selectedTeachers   - Array of currently selected/queued teacher objects
 *   onChange           - Callback when selected teachers list changes: (teachers) => void
 *   assignedTeacherIds - Array of IDs of teachers already assigned to this course (to filter them out)
 *   error              - Validation error string (optional)
 */
const TeacherMultiSelect = ({
  teachers = [],
  selectedTeachers = [],
  onChange,
  assignedTeacherIds = [],
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter out teachers already assigned to the course OR already selected
  const availableTeachers = teachers.filter(
    (t) =>
      !assignedTeacherIds.includes(t.id) &&
      !selectedTeachers.some((st) => st.id === t.id)
  );

  // Filter options based on search query
  const filteredOptions = availableTeachers.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      t.name.toLowerCase().includes(query) ||
      t.email.toLowerCase().includes(query) ||
      t.department.toLowerCase().includes(query) ||
      t.designation.toLowerCase().includes(query)
    );
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (teacher) => {
    const updated = [...selectedTeachers, teacher];
    onChange(updated);
    setSearchQuery('');
    // Keep focus to allow selecting another
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRemove = (teacherId) => {
    const updated = selectedTeachers.filter((t) => t.id !== teacherId);
    onChange(updated);
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      <label
        htmlFor="teacher-search-select-input"
        className="block text-sm font-semibold text-gray-700 mb-1.5"
      >
        Select Teacher(s)
      </label>
      <div className="space-y-3">
        {/* Input area */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>

          <input
            ref={inputRef}
            id="teacher-search-select-input"
            type="text"
            className={`input-field pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
            }`}
            placeholder="Type teacher name, department or email..."
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

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            id="teacher-select-toggle"
            aria-label="Toggle teachers list"
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 animate-fade-in" id="teacher-select-error" role="alert">
            {error}
          </p>
        )}

        {/* Selected teachers badge queue */}
        {selectedTeachers.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-fade-in">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider w-full mb-1 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              Selected to Assign ({selectedTeachers.length})
            </span>
            {selectedTeachers.map((teacher) => (
              <span
                key={teacher.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs font-semibold text-gray-800 shadow-sm animate-scale-in"
              >
                <span>{teacher.name}</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {teacher.department}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(teacher.id)}
                  id={`remove-selected-teacher-${teacher.id}`}
                  className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  aria-label={`Remove ${teacher.name} from selection`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          id="teacher-select-dropdown"
          className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-slide-up focus:outline-none"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((teacher) => (
                <li
                  key={teacher.id}
                  id={`teacher-option-${teacher.id}`}
                  role="option"
                  onClick={() => handleSelect(teacher)}
                  className="px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50/50 hover:text-indigo-900 text-gray-700 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-850">{teacher.name}</div>
                    <div className="text-xs text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="font-medium text-indigo-600">{teacher.designation}</span>
                      <span className="text-gray-300">•</span>
                      <span>{teacher.department} Department</span>
                      <span className="text-gray-300">•</span>
                      <span>{teacher.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 px-2 py-1 rounded font-semibold flex items-center gap-1">
                    Select
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              {teachers.length === 0
                ? 'No teachers available'
                : availableTeachers.length === 0
                ? 'All available teachers are already selected or assigned'
                : 'No matching teachers found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherMultiSelect;
