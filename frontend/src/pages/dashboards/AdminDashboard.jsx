import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  BookOpen,
  BarChart3,
  LogOut,
  Bell,
  UserPlus,
  Upload,
  List,
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

const AdminDashboard = () => {
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
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>
            <button
              id="admin-logout-btn"
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user?.name ?? 'Administrator'} 👋
          </h1>
          <p className="mt-2 text-indigo-100 text-sm">
            You have full administrative access to CampusHive.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          <StatCard icon={Users} label="Total Users" value="—" color="bg-indigo-500" />
          <StatCard icon={BookOpen} label="Active Courses" value="—" color="bg-purple-500" />
          <StatCard icon={BarChart3} label="Reports" value="—" color="bg-sky-500" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/students/add"
              id="admin-add-student-link"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Student</p>
                <p className="text-xs text-gray-500">Register a new student</p>
              </div>
            </Link>

            <Link
              to="/admin/students/import"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Upload className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Import CSV</p>
                <p className="text-xs text-gray-500">Bulk register students</p>
              </div>
            </Link>

            <Link
              to="/admin/students"
              id="admin-view-students-link"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <List className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">View Students</p>
                <p className="text-xs text-gray-500">Browse & filter student list</p>
              </div>
            </Link>

            <Link
              to="/admin/teachers/add"
              id="admin-register-teacher-link"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Register Teacher</p>
                <p className="text-xs text-gray-500">Onboard a new teacher</p>
              </div>
            </Link>

            <Link
              to="/admin/teachers"
              id="admin-view-teachers-link"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <List className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">View Teachers</p>
                <p className="text-xs text-gray-500">Browse & filter teacher list</p>
              </div>
            </Link>

            <Link
              to="/admin/courses/create"
              id="admin-create-course-link"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Create Course</p>
                <p className="text-xs text-gray-500">Add a new academic course</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
