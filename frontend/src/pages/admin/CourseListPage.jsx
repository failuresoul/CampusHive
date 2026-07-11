import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, BookOpen, LogOut, Bell, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * CourseListPage (Placeholder)
 * Renders a placeholder route for /admin/courses as requested in Story 11.
 */
const CourseListPage = () => {
  const { logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
              Course List
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Academic Courses
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Browse and manage courses offered in CampusHive.
              </p>
            </div>
          </div>
          <Link
            to="/admin/courses/create"
            className="inline-flex justify-center items-center px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            Create Course
          </Link>
        </div>

        {/* Placeholder Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 animate-slide-up">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center">
              <Info className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Course List View is Under Construction</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              We are working hard to build the list view and course mapping interface. For now, you can create new courses and verify database integration.
            </p>
          </div>
          <div>
            <Link
              to="/admin/dashboard"
              className="inline-flex justify-center items-center px-5 py-2.5 bg-gray-150 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseListPage;
