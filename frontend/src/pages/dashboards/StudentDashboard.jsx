import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookMarked,
  Star,
  ClipboardCheck,
  Calendar,
  LogOut,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StudentNotificationBell from '../../components/student/NotificationBell';

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const content = (
    <>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </>
  );

  const className = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5 hover:shadow-md transition-shadow";

  if (to) {
    return (
      <Link to={to} className={`${className} hover:border-amber-200 cursor-pointer`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

const StudentDashboard = () => {
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
            <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <BookMarked className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              Student
            </span>
          </div>
          <div className="flex items-center gap-3">
            <StudentNotificationBell />
            <button
              id="student-logout-btn"
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
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <p className="text-amber-100 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {user?.name ?? 'Student'} 👋
          </h1>
          <p className="mt-2 text-amber-100 text-sm">
            Check your courses, grades, and upcoming assignments.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={BookMarked} label="Enrolled Courses" value="—" color="bg-amber-500" to="/student/courses" />
          <StatCard icon={Star} label="GPA" value="—" color="bg-orange-500" />
          <StatCard icon={ClipboardCheck} label="Assignments Due" value="—" color="bg-rose-500" />
          <StatCard icon={Calendar} label="Upcoming Exams" value="—" color="bg-pink-500" />
        </div>

        {/* Study Circles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Study Circles</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Organize peer study groups or join collaborative study sessions. Create review sessions for exams, lab assignments, or topics.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/student/study-sessions/create"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]"
              >
                Post Study Session
              </Link>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <BookMarked className="h-10 w-10 text-amber-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">Student Portal</h2>
          <p className="text-sm text-gray-400 mt-1">
            Course and grade features will be built out in the next epic.
          </p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
