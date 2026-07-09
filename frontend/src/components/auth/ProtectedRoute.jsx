import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleRoutes = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

/**
 * ProtectedRoute
 *
 * Props:
 *   children     — the page component to render if access is granted
 *   allowedRoles — optional string[] of roles that may access this route
 *                  e.g. ['admin'] or ['admin', 'teacher']
 *                  if omitted, any authenticated user is allowed
 *
 * Behaviour:
 *   1. While AuthContext is still rehydrating → show spinner (no flash)
 *   2. Not logged in                          → redirect to /login
 *   3. Logged in but wrong role               → redirect to /403
 *   4. Logged in with correct role            → render children
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ── 1. Still reading from localStorage — don't make any decision yet ──────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ── 2. Not authenticated ───────────────────────────────────────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Authenticated but wrong role ───────────────────────────────────────
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard (better UX than a hard 403 dead-end)
    // but keep /403 as the destination so the URL makes the problem clear
    return <Navigate to="/403" replace />;
  }

  // ── 4. All checks passed — render the page ────────────────────────────────
  return children;
};

export default ProtectedRoute;
