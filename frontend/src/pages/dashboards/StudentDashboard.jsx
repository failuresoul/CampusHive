import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookMarked,
  Star,
  ClipboardCheck,
  Calendar,
  LogOut,
  Bookmark,
} from 'lucide-react';
import StudentNotificationBell from '../../components/student/NotificationBell';
import dashboardService from '../../services/dashboardService';

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
  const { user, token, logoutContext } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledCount: '—',
    gpa: '—',
    assignmentsDue: '—',
    examsCount: '—',
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStudentStats(token);
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load student stats:', err);
      }
    };
    if (token) {
      fetchStats();
    }
  }, [token]);

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
            <Link
              to="/student/bookmarks"
              className="p-2 text-gray-500 hover:text-amber-500 hover:bg-gray-100 rounded-xl transition-colors"
              title="My Bookmarks"
            >
              <Bookmark className="h-5 w-5" />
            </Link>
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
          <StatCard icon={BookMarked} label="Enrolled Courses" value={stats.enrolledCount} color="bg-amber-500" to="/student/courses" />
          <StatCard icon={Star} label="GPA" value={stats.gpa} color="bg-orange-500" />
          <StatCard icon={ClipboardCheck} label="Assignments Due" value={stats.assignmentsDue} color="bg-rose-500" />
          <StatCard icon={Calendar} label="Upcoming Exams" value={stats.examsCount} color="bg-pink-500" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/student/courses"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <BookMarked className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">My Courses</p>
                <p className="text-xs text-gray-500">Access course slides & quizzes</p>
              </div>
            </Link>

            <Link
              to="/student/bookmarks"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Bookmark className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">My Bookmarks</p>
                <p className="text-xs text-gray-500">Quick access to starred files</p>
              </div>
            </Link>

            <Link
              to="/lost-found"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Lost & Found</p>
                <p className="text-xs text-gray-500">Claim lost/found items</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
