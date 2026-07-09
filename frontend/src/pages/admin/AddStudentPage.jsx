import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  Users,
  LogOut,
  Bell,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StudentForm from '../../components/admin/StudentForm';

/**
 * AddStudentPage
 *
 * Admin-only page that renders the "Add New Student" form.
 * Route: /admin/students/add
 * Protected by ProtectedRoute (allowedRoles=['admin']) in App.jsx.
 *
 * This page is UI-only (Story 1).  The form submission is stubbed —
 * see StudentForm.jsx for the TODO comment that wires it to
 * POST /api/students once Story 2 (roll-number generation) and the
 * backend (Story 4) are ready.
 */
const AddStudentPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  // After successful (stub) submission, stay on the page so admin can add more
  const handleSuccess = () => {
    // Future: redirect to student list, show notification, etc.
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
              id="admin-add-student-logout-btn"
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
                to="/admin/students"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Students
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li className="text-gray-800 font-semibold" aria-current="page">
              Add New Student
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Add New Student
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details below to register a student.{' '}
              <span className="text-amber-600 font-medium">
                Roll numbers are assigned automatically.
              </span>
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-slide-up">
          {/* Greeting strip */}
          <div className="mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center gap-3">
            <span className="text-lg" aria-hidden="true">👤</span>
            <p className="text-sm text-indigo-700">
              Logged in as{' '}
              <span className="font-semibold">{user?.name ?? 'Administrator'}</span>
            </p>
          </div>

          <StudentForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>

        {/* Payload documentation note (for Story 2 & Story 4) */}
        <aside
          aria-label="Developer note"
          className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1"
        >
          <p className="font-semibold text-amber-900">📦 Expected Student Payload (for Story 2 &amp; Story 4)</p>
          <pre className="overflow-x-auto text-amber-700 font-mono whitespace-pre-wrap leading-relaxed">
{`{
  name:       string   // full name, min 2 chars
  email:      string   // used as login credential
  dob:        string   // ISO date "YYYY-MM-DD"
  department: string   // "CSE" | "EEE" | "ME" | "CE" | "BBA" | "ENG"
  batch:      string   // e.g. "2023-2024"
  phone:      string   // optional; 7–15 digits
  // rollNumber → generated server-side (Story 2)
}`}
          </pre>
        </aside>
      </main>
    </div>
  );
};

export default AddStudentPage;
