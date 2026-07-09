import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  LogOut,
  Bell,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              Teacher
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button
              id="teacher-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <p className="text-emerald-100 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user?.name ?? 'Teacher'} 👋
          </h1>
          <p className="mt-2 text-emerald-100 text-sm">
            Manage your courses, students, and assignments from here.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <StatCard icon={BookOpen} label="My Courses" value="—" color="bg-emerald-500" />
          <StatCard icon={Users} label="My Students" value="—" color="bg-teal-500" />
          <StatCard icon={ClipboardList} label="Assignments" value="—" color="bg-cyan-500" />
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <GraduationCap className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Teacher Portal</h2>
          <p className="text-sm text-gray-400 mt-1">
            Course management features will be built out in the next epic.
          </p>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
