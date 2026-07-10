import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  Users,
  LogOut,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TeacherForm from '../../components/admin/TeacherForm';

/**
 * RegisterTeacherPage
 *
 * Admin-only page for registering a new teacher.
 * Route: /admin/teachers/add
 * Protected by ProtectedRoute (allowedRoles=['admin']) in App.jsx.
 *
 * The form submission is stubbed at this stage.
 * TODO (Story 8): wire TeacherForm to POST /api/teachers.
 */
const RegisterTeacherPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  // After successful (stub) submission, stay on the page so admin can register more
  const handleSuccess = () => {
    // Future (Story 8): could redirect to teacher list or show a toast at page level
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
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
              <Users className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              id="register-teacher-logout-btn"
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
            <li>
              <Link
                to="/admin/teachers"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Teachers
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li className="text-gray-800 font-semibold" aria-current="page">
              Register Teacher
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Register New Teacher
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to onboard a new teacher.{' '}
              <span className="text-amber-600 font-medium">
                A temporary password will be auto-generated as their initial login.
              </span>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-slide-up">
          {/* Greeting strip */}
          <div className="mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">🎓</span>
            <p className="text-sm text-indigo-700">
              Logged in as{' '}
              <span className="font-semibold">{user?.name ?? 'Administrator'}</span>
            </p>
          </div>

          <TeacherForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </main>
    </div>
  );
};

export default RegisterTeacherPage;
