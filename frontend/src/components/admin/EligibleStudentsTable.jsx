import React, { useState } from 'react';
import { Search, AlertCircle, Sparkles } from 'lucide-react';

/**
 * EligibleStudentsTable
 *
 * Displays a searchable table of students eligible for auto-enrollment.
 *
 * Props:
 *   students - Array of student objects:
 *              [{ id, name, rollNumber, email, status }]
 *              status can be: 'Eligible', 'Already Enrolled', 'Enrolled'
 */
const EligibleStudentsTable = ({ students = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students by name, roll number, or email
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      student.name.toLowerCase().includes(term) ||
      student.rollNumber.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Already Enrolled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            Already Enrolled
          </span>
        );
      case 'Enrolled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-150 text-green-700 border border-green-200 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Enrolled
          </span>
        );
      case 'Eligible':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            Eligible
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            Eligible Students Preview
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Previewing matching students based on course criteria.
          </p>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search name, roll, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Roll Number
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-left">
                Email Address
              </th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 block">
                      {student.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-600 block">
                      {student.rollNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 block truncate max-w-[200px] sm:max-w-xs">
                      {student.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(student.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-12">
                  <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                    <AlertCircle className="h-8 w-8 text-gray-350 animate-bounce" />
                    <p className="text-sm font-medium">No matching students found</p>
                    <p className="text-xs text-gray-400">
                      Try clearing or changing your search criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-auto px-6 py-4 bg-gray-50/50 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-center gap-2">
        <span className="text-xs font-medium text-gray-500">
          Showing {filteredStudents.length} of {students.length} eligible students
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-50 border border-primary-100 text-primary-700">
            {students.filter(s => s.status === 'Eligible').length} Eligible
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
            {students.filter(s => s.status === 'Already Enrolled' || s.status === 'Enrolled').length} Enrolled
          </span>
        </div>
      </div>
    </div>
  );
};

export default EligibleStudentsTable;
