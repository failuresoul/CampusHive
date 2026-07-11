import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  BookOpen,
  LogOut,
  Bell,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CourseForm from '../../components/admin/CourseForm';

/**
 * CreateCoursePage
 *
 * Admin-only page that renders the "Create Academic Course" form.
 * Route: /admin/courses/create
 * Protected by ProtectedRoute (allowedRoles=['admin']) in App.jsx.
 *
 * This page is UI-only (Story 10). The form submission is stubbed —
 * see CourseForm.jsx for the TODO comment that wires it to
 * POST /api/courses once Story 11 is ready.
 */
const CreateCoursePage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null);

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const handleSuccess = (course) => {
    setCreatedCourse(course);
    setIsSuccess(true);
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  const handleCreateAnother = () => {
    setCreatedCourse(null);
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">CampusHive</span>
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
              <BookOpen className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              id="admin-create-course-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Create Course
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Create New Course
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the fields below to create a new academic course.
            </p>
          </div>
        </div>

        {/* Form Card or Success Confirmation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-slide-up">
          {isSuccess && createdCourse ? (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Created Successfully!</h2>
                <p className="mt-2 text-sm text-gray-500">
                  The course has been successfully persisted in the database.
                </p>
              </div>

              {/* Course Detail Box */}
              <div className="bg-gray-50 rounded-xl border border-gray-250 p-5 max-w-md mx-auto text-left space-y-3">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Course Code</span>
                  <span className="text-base font-bold text-indigo-700">{createdCourse.code}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Course Title</span>
                  <span className="text-base font-semibold text-gray-800">{createdCourse.title}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Department</span>
                    <span className="text-base font-semibold text-gray-800">{createdCourse.department}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Credit Hours</span>
                    <span className="text-base font-semibold text-gray-800">{createdCourse.creditHours}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  type="button"
                  id="create-another-course-btn"
                  onClick={handleCreateAnother}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
                >
                  Create Another Course
                </button>
                <Link
                  to="/admin/courses"
                  id="view-course-list-btn"
                  className="inline-flex justify-center items-center px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  View Course List
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Greeting strip */}
              <div className="mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center gap-3">
                <span className="text-lg" aria-hidden="true">👤</span>
                <p className="text-sm text-indigo-700">
                  Logged in as{' '}
                  <span className="font-semibold">{user?.name ?? 'Administrator'}</span>
                </p>
              </div>

              <CourseForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateCoursePage;
