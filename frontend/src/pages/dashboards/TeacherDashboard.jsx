import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardList,
  LogOut,
  Inbox,
  AlertCircle
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import NotificationBell from '../../components/teacher/NotificationBell';

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
      <Link to={to} className={`${className} hover:border-emerald-200 cursor-pointer`}>
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

const TeacherDashboard = () => {
  const { user, token, logoutContext } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    coursesCount: '—',
    studentsCount: '—',
    submissionsCount: '—',
    courses: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await dashboardService.getTeacherStats(token);
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch teacher stats:', err);
      } finally {
        setIsLoading(false);
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
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CampusHive</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              Teacher
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
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
          <StatCard icon={BookOpen} label="My Courses" value={stats.coursesCount} color="bg-emerald-500" />
          <StatCard icon={Users} label="My Students" value={stats.studentsCount} color="bg-teal-500" />
          <StatCard icon={ClipboardList} label="Pending Grading" value={stats.submissionsCount} color="bg-cyan-500" to="/teacher/submissions" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/teacher/submissions"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-emerald-250 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Submissions Queue</p>
                <p className="text-xs text-gray-500">Grade & review student lab reports</p>
              </div>
            </Link>

            <Link
              to="/lost-found"
              className="group flex items-center gap-4 p-4 rounded-xl border border-dashed border-emerald-250 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <Inbox className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Lost & Found Hub</p>
                <p className="text-xs text-gray-500">Browse reported items around campus</p>
              </div>
            </Link>
          </div>
        </div>

        {/* My Assigned Courses */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">My Assigned Courses</h2>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              Active Term
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="border border-gray-100 rounded-2xl p-5 animate-pulse h-36">
                  <div className="w-16 h-4 bg-gray-100 rounded mb-2"></div>
                  <div className="w-3/4 h-5 bg-gray-100 rounded mb-4"></div>
                  <div className="w-1/2 h-8 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : stats.courses.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">You are not currently assigned to any courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.courses.map((c) => (
                <div 
                  key={c.id} 
                  className="p-5 border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between h-40 bg-white"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {c.code}
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm mt-2 line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                      {c.department} • CREDITS: {c.creditHours}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                    <Link
                      to={`/teacher/courses/${c.id}/materials`}
                      className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-600/10"
                    >
                      Files Hub
                    </Link>
                    <Link
                      to={`/teacher/courses/${c.id}/quizzes/create`}
                      className="flex-1 text-center py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all"
                    >
                      New Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
