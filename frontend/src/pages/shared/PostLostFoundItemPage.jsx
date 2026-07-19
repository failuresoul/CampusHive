import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookMarked,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import LostFoundForm from '../../components/lostfound/LostFoundForm';

const PostLostFoundItemPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const roleConfigs = {
    student: {
      dashboard: '/student/dashboard',
      badgeClass: 'bg-amber-100 text-amber-700',
      logoBg: 'bg-amber-500',
      LogoIcon: BookMarked,
      badgeLabel: 'Student',
    },
    teacher: {
      dashboard: '/teacher/dashboard',
      badgeClass: 'bg-emerald-100 text-emerald-700',
      logoBg: 'bg-emerald-600',
      LogoIcon: GraduationCap,
      badgeLabel: 'Teacher',
    },
    admin: {
      dashboard: '/admin/dashboard',
      badgeClass: 'bg-indigo-100 text-indigo-700',
      logoBg: 'bg-indigo-600',
      LogoIcon: ShieldCheck,
      badgeLabel: 'Admin',
    },
  };

  const currentRole = user?.role || 'student';
  const config = roleConfigs[currentRole] || {
    dashboard: '/login',
    badgeClass: 'bg-primary-100 text-primary-700',
    logoBg: 'bg-primary-600',
    LogoIcon: HelpCircle,
    badgeLabel: 'User',
  };

  const handleCancel = () => {
    navigate(config.dashboard);
  };

  const LogoIconComponent = config.LogoIcon;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 ${config.logoBg} rounded-lg flex items-center justify-center`}>
              <LogoIconComponent className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`}>
              {config.badgeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Navigation / Page Title Header */}
        <div className="mb-8 flex items-center gap-4 animate-fade-in">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Report Lost/Found Item
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a campus-wide post to help recover lost items or return found belongings.
            </p>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up">
          <div className="p-6 sm:p-10">
            <LostFoundForm onCancel={handleCancel} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostLostFoundItemPage;
