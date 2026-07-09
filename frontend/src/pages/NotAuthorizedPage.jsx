import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft } from 'lucide-react';

const roleRoutes = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
};

const roleLabels = {
  admin: 'Admin',
  teacher: 'Teacher',
  student: 'Student',
};

const roleColors = {
  admin: 'text-indigo-600',
  teacher: 'text-emerald-600',
  student: 'text-amber-600',
};

const NotAuthorizedPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user?.role && roleRoutes[user.role]) {
      navigate(roleRoutes[user.role], { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = () => {
    logoutContext();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">403</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-700">Access Denied</h2>

        {/* Description */}
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          You don&apos;t have permission to view this page.
          {user?.role && (
            <>
              {' '}Your role is{' '}
              <span className={`font-semibold ${roleColors[user.role] ?? 'text-gray-700'}`}>
                {roleLabels[user.role] ?? user.role}
              </span>
              .
            </>
          )}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="back-to-dashboard-btn"
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to My Dashboard' : 'Go to Login'}
          </button>

          {user && (
            <button
              id="403-logout-btn"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotAuthorizedPage;
