import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  BookOpen,
  LogOut,
  Bell,
  UserCheck,
  UserPlus,
  Loader2,
  Trash2,
  AlertCircle,
  GraduationCap,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CourseSelector from '../../components/admin/CourseSelector';
import TeacherMultiSelect from '../../components/admin/TeacherMultiSelect';

// Mock data imports
import {
  MOCK_COURSES,
  MOCK_TEACHERS,
  INITIAL_ASSIGNMENTS,
} from '../../mocks/courses.mock';

const AssignTeacherPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  // Local state for courses & teachers lists
  // TODO: Swap these for real GET /api/courses and GET /api/teachers once available in Story 13
  const [courses] = useState(MOCK_COURSES);
  const [teachers] = useState(MOCK_TEACHERS);

  // Selected course state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  // Local state tracking assignments mapping: { courseId: [teacherId, ...] }
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);

  // Multi-select queued teachers state (selected to be assigned)
  const [queuedTeachers, setQueuedTeachers] = useState([]);
  
  // Loading & feedback states
  const [isAssigning, setIsAssigning] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Reset alert on course change
  useEffect(() => {
    setAlert({ type: '', message: '' });
    setQueuedTeachers([]);
  }, [selectedCourseId]);

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Get teacher details for currently assigned teachers of selected course
  const assignedTeacherIds = assignments[selectedCourseId] || [];
  const assignedTeachers = teachers.filter((t) => assignedTeacherIds.includes(t.id));

  /**
   * handleAssign
   * Assigns the selected queue of teachers to the current course.
   */
  const handleAssign = async () => {
    if (!selectedCourseId) {
      setAlert({ type: 'error', message: 'Please select a course first.' });
      return;
    }
    if (queuedTeachers.length === 0) {
      setAlert({ type: 'error', message: 'Please select at least one teacher to assign.' });
      return;
    }

    setIsAssigning(true);
    setAlert({ type: '', message: '' });

    // TODO: Connect to POST /api/courses/:courseId/teachers in Story 13
    // E.g., const response = await axios.post(`/api/courses/${selectedCourseId}/teachers`, { teacherIds: queuedTeachers.map(t => t.id) }, { headers });

    // Simulate network delay / loading flash (800ms)
    setTimeout(() => {
      const newTeacherIds = queuedTeachers.map((t) => t.id);
      
      setAssignments((prev) => {
        const currentList = prev[selectedCourseId] || [];
        // Combine and keep unique values just in case
        const updatedList = Array.from(new Set([...currentList, ...newTeacherIds]));
        return {
          ...prev,
          [selectedCourseId]: updatedList,
        };
      });

      setAlert({
        type: 'success',
        message: `Successfully assigned ${queuedTeachers.length} teacher(s) to ${selectedCourse.code}.`,
      });
      setQueuedTeachers([]);
      setIsAssigning(false);
    }, 800); // 800ms loading flash
  };

  /**
   * handleRemove
   * Removes a teacher from the course assignment.
   */
  const handleRemove = (teacherId, teacherName) => {
    if (!selectedCourseId) return;

    // TODO: Connect to DELETE /api/courses/:courseId/teachers/:teacherId in Story 13
    // E.g., await axios.delete(`/api/courses/${selectedCourseId}/teachers/${teacherId}`, { headers });

    setAssignments((prev) => {
      const currentList = prev[selectedCourseId] || [];
      const updatedList = currentList.filter((id) => id !== teacherId);
      return {
        ...prev,
        [selectedCourseId]: updatedList,
      };
    });

    setAlert({
      type: 'success',
      message: `Removed ${teacherName} from course ${selectedCourse.code}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* ── Top Navigation Bar ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">CampusHive</span>
            <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Admin
            </span>
          </div>

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
              <BookOpen className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-450"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout Content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Assign Teachers
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Assign Teachers to Courses
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Map qualified academic faculty members to current courses.
              </p>
            </div>
          </div>
        </div>

        {/* Global Feedback Toast / Alert Banner */}
        {alert.message && (
          <div
            id="assign-teacher-alert"
            role="alert"
            className={`mb-6 flex items-start gap-3 p-4 rounded-xl border text-sm animate-slide-up ${
              alert.type === 'success'
                ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${alert.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <p className="flex-1 font-medium">{alert.message}</p>
            <button
              onClick={() => setAlert({ type: '', message: '' })}
              className="text-current opacity-60 hover:opacity-100 focus:outline-none font-semibold px-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── COURSE SELECTOR CARD (Takes 1/3 layout) ── */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-500" />
                Course Selection
              </h2>
              <p className="text-xs text-gray-400 mt-1">Select the course you want to manage assignments for.</p>
            </div>

            <CourseSelector
              courses={courses}
              selectedId={selectedCourseId}
              onSelect={(course) => setSelectedCourseId(course ? course.id : '')}
            />

            {selectedCourse && (
              <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-4 animate-scale-in text-xs">
                <h3 className="font-semibold text-gray-800 uppercase tracking-wider text-[10px] text-gray-400">
                  Course Metadata
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block font-medium">Course Code</span>
                    <span className="text-sm font-bold text-indigo-700">{selectedCourse.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Department</span>
                    <span className="text-sm font-bold text-gray-800">{selectedCourse.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Credits</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedCourse.creditHours} Hours</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">Batch/Semester</span>
                    <span className="text-sm font-semibold text-gray-800">{selectedCourse.batchSemester}</span>
                  </div>
                </div>
                {selectedCourse.description && (
                  <div className="border-t border-gray-200 pt-3">
                    <span className="text-gray-400 block font-medium mb-1">Description</span>
                    <p className="text-gray-600 leading-relaxed font-normal">{selectedCourse.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── TEACHER MANAGEMENT CARD (Takes 2/3 layout) ── */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedCourseId ? (
              /* No Course Selected Info Panel */
              <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm space-y-4">
                <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                  <BookOpen className="h-7 w-7 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">No Course Selected</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
                    Please use the Course Selection tool on the left to pick an academic course to view, assign, or remove teachers.
                  </p>
                </div>
              </div>
            ) : (
              /* Course Selected - Management UI */
              <>
                {/* Assignment Form Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 animate-slide-up">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <UserPlus className="h-4.5 w-4.5 text-indigo-500" />
                      Assign New Faculty
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Search and queue multiple teachers, then save updates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <TeacherMultiSelect
                      teachers={teachers}
                      selectedTeachers={queuedTeachers}
                      onChange={setQueuedTeachers}
                      assignedTeacherIds={assignedTeacherIds}
                    />

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        id="assign-teachers-btn"
                        onClick={handleAssign}
                        disabled={isAssigning || queuedTeachers.length === 0}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all cursor-pointer"
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Assigning Teachers...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            <span>Assign Teacher(s)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assigned Teachers List Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 animate-slide-up">
                  <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 text-indigo-500" />
                        Currently Assigned Teachers
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Active course instructors mapping for <span className="font-semibold text-indigo-600">{selectedCourse.code}</span>
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
                      {assignedTeachers.length} Total
                    </span>
                  </div>

                  {assignedTeachers.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                      No teachers assigned to this course yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-150">
                      <table className="min-w-full divide-y divide-gray-150 text-left text-xs sm:text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold text-[10px]">
                          <tr>
                            <th scope="col" className="px-4 py-3">Teacher Info</th>
                            <th scope="col" className="px-4 py-3 hidden sm:table-cell">Department</th>
                            <th scope="col" className="px-4 py-3 hidden md:table-cell">Designation</th>
                            <th scope="col" className="px-4 py-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 bg-white font-medium text-gray-800">
                          {assignedTeachers.map((teacher) => (
                            <tr key={teacher.id} id={`assigned-teacher-row-${teacher.id}`} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3.5">
                                <div className="font-semibold text-gray-900">{teacher.name}</div>
                                <div className="text-[11px] text-gray-400 font-normal mt-0.5">{teacher.email}</div>
                                {/* Mobile display for designation/dept */}
                                <div className="flex gap-2 mt-1 sm:hidden">
                                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                    {teacher.department}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {teacher.designation}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 hidden sm:table-cell">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                                  {teacher.department}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                                {teacher.designation}
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemove(teacher.id, teacher.name)}
                                  id={`remove-teacher-btn-${teacher.id}`}
                                  aria-label={`Remove ${teacher.name} from course`}
                                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer font-semibold"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Remove</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssignTeacherPage;
