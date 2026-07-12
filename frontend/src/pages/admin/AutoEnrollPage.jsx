import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  BookOpen,
  LogOut,
  Bell,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CourseSelector from '../../components/admin/CourseSelector';
import EligibleStudentsTable from '../../components/admin/EligibleStudentsTable';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { getCourses } from '../../services/courseService';

const AutoEnrollPage = () => {
  const { token, logoutContext } = useAuth();
  const navigate = useNavigate();

  // Local state
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  
  // UI states
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isEnrollLoading, setIsEnrollLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [enrollSummary, setEnrollSummary] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });

  /**
   * handlePreview
   * Simulates fetching eligible students for a course.
   *
   * TODO: connect to GET /api/courses/:courseId/eligible-students and POST /api/courses/:courseId/auto-enroll in Story 15
   */
  const handlePreview = useCallback(async (courseId) => {
    setIsPreviewLoading(true);
    setEnrollSummary(null);
    setAlert({ type: '', message: '' });
    
    try {
      // Simulate API call lag
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const course = courses.find((c) => c.id === courseId);
      if (course) {
        const dept = course.department || 'CSE';
        const batch = course.batchSemester || '2023-2024';
        
        // Generate mock data: 42 eligible, 3 already enrolled
        const mockData = generateMockStudents(dept, batch);
        setStudents(mockData);
      }
    } catch (err) {
      console.error('Error generating preview:', err);
      setAlert({
        type: 'error',
        message: 'Failed to generate eligible students preview.',
      });
    } finally {
      setIsPreviewLoading(false);
    }
  }, [courses]);

  // 1. Fetch courses list for selector
  useEffect(() => {
    const fetchCoursesList = async () => {
      setIsLoadingCourses(true);
      try {
        const list = await getCourses('', token);
        setCourses(list || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setAlert({
          type: 'error',
          message: 'Failed to load courses. Please refresh the page.',
        });
      } finally {
        setIsLoadingCourses(false);
      }
    };

    if (token) {
      fetchCoursesList();
    }
  }, [token]);

  // 2. Fetch eligible students preview when course is selected
  useEffect(() => {
    if (selectedCourse) {
      handlePreview(selectedCourse.id);
    } else {
      setStudents([]);
      setEnrollSummary(null);
    }
  }, [selectedCourse, handlePreview]);

  /**
   * handleEnroll
   * Simulates post auto-enroll trigger.
   *
   * TODO: connect to POST /api/courses/:courseId/auto-enroll in Story 15
   */
  const handleEnroll = async () => {
    if (!selectedCourse) return;
    
    setIsEnrollLoading(true);
    setAlert({ type: '', message: '' });
    
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update statuses in the list to 'Enrolled'
      const updatedStudents = students.map((s) => {
        if (s.status === 'Eligible') {
          return { ...s, status: 'Enrolled' };
        }
        return s;
      });
      setStudents(updatedStudents);

      // Save summary response
      const eligibleCount = students.filter((s) => s.status === 'Eligible').length;
      const skippedCount = students.filter((s) => s.status === 'Already Enrolled').length;
      
      setEnrollSummary({
        enrolled: eligibleCount,
        skipped: skippedCount,
      });

      setAlert({
        type: 'success',
        message: `Auto-enrollment complete. ${eligibleCount} students successfully enrolled.`,
      });
    } catch (err) {
      console.error('Error during auto-enrollment:', err);
      setAlert({
        type: 'error',
        message: 'Bulk enrollment failed. Please try again.',
      });
    } finally {
      setIsEnrollLoading(false);
      setIsConfirmOpen(false);
    }
  };



  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const eligibleCount = students.filter((s) => s.status === 'Eligible').length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
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
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
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
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
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
            <li>
              <Link
                to="/admin/courses"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Courses
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li className="text-gray-800 font-semibold" aria-current="page">
              Auto-Enroll
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Automatic Student Enrollment
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Trigger bulk enrollment for all eligible students matching a course's department and batch.
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {alert.message && (
          <div
            id="auto-enroll-alert"
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        )}

        {/* Post-Action Summary Box */}
        {enrollSummary && (
          <div
            id="post-action-summary"
            className="mb-6 p-6 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-indigo-900">Enrollment Complete</h3>
                <p className="text-xs text-indigo-700 mt-0.5" id="enrollment-summary-details">
                  {enrollSummary.enrolled} students enrolled, {enrollSummary.skipped} already enrolled (skipped)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCourse(null);
                setEnrollSummary(null);
              }}
              className="text-xs font-semibold px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl transition-colors self-start sm:self-center"
            >
              Reset / Enroll Another Course
            </button>
          </div>
        )}

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Course selection & eligibility criteria */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Enrollment Parameters
              </h2>

              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mr-2" />
                  <span className="text-sm">Loading courses...</span>
                </div>
              ) : (
                <CourseSelector
                  courses={courses}
                  selectedId={selectedCourse?.id || ''}
                  onSelect={(course) => setSelectedCourse(course)}
                />
              )}

              {/* Eligibility Criteria Display */}
              {selectedCourse && (
                <div
                  id="eligibility-criteria-card"
                  className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3 animate-slide-up"
                >
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    Target Criteria
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between border-b border-indigo-100/50 pb-1.5">
                      <span className="text-gray-500 font-medium">Department:</span>
                      <span className="font-bold text-indigo-900" id="criteria-department">
                        {selectedCourse.department}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Batch / Semester:</span>
                      <span className="font-bold text-indigo-900" id="criteria-batch">
                        {selectedCourse.batchSemester}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trigger Button */}
              {selectedCourse && (
                <button
                  type="button"
                  id="enroll-all-eligible-btn"
                  onClick={() => setIsConfirmOpen(true)}
                  disabled={eligibleCount === 0 || isEnrollLoading || isPreviewLoading || !!enrollSummary}
                  className="w-full inline-flex justify-center items-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-250 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200"
                >
                  {isEnrollLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing Bulk Enroll...
                    </>
                  ) : (
                    `Enroll All Eligible (${eligibleCount})`
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right panel: Students table preview */}
          <div className="lg:col-span-2">
            {!selectedCourse ? (
              <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center h-full flex flex-col justify-center items-center min-h-[300px]">
                <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <Info className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900">No Course Selected</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">
                  Select a course from the dropdown on the left to load matching student eligibility criteria and preview lists.
                </p>
              </div>
            ) : isPreviewLoading ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center h-full flex flex-col justify-center items-center min-h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <h3 className="text-sm font-bold text-gray-800">Loading Student Preview...</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Retrieving student lists matching department and batch filters...
                </p>
              </div>
            ) : (
              <div className="animate-slide-up">
                <EligibleStudentsTable students={students} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      {selectedCourse && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="Confirm Auto-Enrollment"
          message={`Are you sure you want to register all ${eligibleCount} eligible students into ${selectedCourse.code} - ${selectedCourse.title}? Currently enrolled students will not be affected.`}
          confirmText="Enroll Students"
          cancelText="Cancel"
          isLoading={isEnrollLoading}
          onConfirm={handleEnroll}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default AutoEnrollPage;

/**
 * Helper to generate clean mock data representing students
 */
const generateMockStudents = (department, batch) => {
  const list = [];
  const formattedBatch = batch.includes('-') ? batch.split('-')[0] : batch;

  // 3 students already enrolled
  for (let i = 1; i <= 3; i++) {
    list.push({
      id: `enrolled-${i}`,
      name: `Student Enrolled ${i}`,
      rollNumber: `${department}-${formattedBatch}-${String(i).padStart(3, '0')}`,
      email: `enrolled${i}.${department.toLowerCase()}@campushive.edu`,
      status: 'Already Enrolled',
    });
  }

  // 42 eligible students to enroll
  for (let i = 4; i <= 45; i++) {
    list.push({
      id: `eligible-${i}`,
      name: `Student Eligible ${i}`,
      rollNumber: `${department}-${formattedBatch}-${String(i).padStart(3, '0')}`,
      email: `eligible${i}.${department.toLowerCase()}@campushive.edu`,
      status: 'Eligible',
    });
  }

  return list;
};
