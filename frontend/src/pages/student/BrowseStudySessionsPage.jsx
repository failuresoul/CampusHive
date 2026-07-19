import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CalendarRange, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyCourses } from '../../services/studentService';
import { getStudySessions } from '../../services/studyCircleService';
import StudySessionCard from '../../components/studycircle/StudySessionCard';

const BrowseStudySessionsPage = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

  // Filters State
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6; // Display 6 per page for a clean 3x2 grid layout

  // SEO: Title & Meta Description
  useEffect(() => {
    document.title = 'Browse Study Sessions | CampusHive';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Explore and RSVP to collaborative student-led study sessions and review groups on CampusHive.');
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const data = await getMyCourses(token);
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token]);

  // Fetch study sessions based on filters & page
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const response = await getStudySessions({
        courseId: selectedCourseId,
        upcoming: upcomingOnly,
        page,
        pageSize
      }, token);

      setSessions(response.sessions || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch study sessions:', err);
      setSessionsError('Unable to load study sessions. Please check your network and try again.');
    } finally {
      setLoadingSessions(false);
    }
  }, [selectedCourseId, upcomingOnly, page, token]);

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token, fetchSessions]);

  // Reset page when filters change
  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
    setPage(1);
  };

  const handleUpcomingToggle = (upcomingValue) => {
    setUpcomingOnly(upcomingValue);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/student/dashboard" 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              aria-label="Back to Student Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Study Sessions</h1>
              <p className="text-sm text-gray-500">Find and join study circles organized by your classmates</p>
            </div>
          </div>
          <Link
            to="/student/study-sessions/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]"
            id="create-session-cta-btn"
          >
            <Plus className="w-5 h-5" />
            Post Study Session
          </Link>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Course Filter */}
            <div className="relative min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="w-4 h-4 text-gray-400" />
              </div>
              <select
                id="course-filter-select"
                value={selectedCourseId}
                onChange={handleCourseChange}
                disabled={loadingCourses}
                className="pl-10 pr-10 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-gray-300 transition-all appearance-none"
              >
                <option value="">All My Enrolled Courses</option>
                {courses.map((course) => (
                  <option key={course.id || course._id} value={course.id || course._id}>
                    {course.code ? `${course.code} - ${course.name}` : course.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>

            {/* Upcoming / Past Tab Group */}
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => handleUpcomingToggle(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  upcomingOnly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                id="filter-upcoming-btn"
              >
                Upcoming Only
              </button>
              <button
                onClick={() => handleUpcomingToggle(false)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !upcomingOnly
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                id="filter-past-btn"
              >
                Show Past Sessions
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          {!loadingSessions && !sessionsError && (
            <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase self-end md:self-auto">
              Showing {sessions.length} sessions
            </span>
          )}
        </div>

        {/* Sessions Feed */}
        {loadingSessions ? (
          /* Loading Skeletons Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="space-y-2.5 pt-2">
                  <div className="h-4 bg-gray-150 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-150 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-150 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-100 rounded w-full pt-4 mt-4"></div>
              </div>
            ))}
          </div>
        ) : sessionsError ? (
          /* Error Fallback Banner */
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Sessions</h3>
            <p className="text-sm text-gray-500 mb-6">{sessionsError}</p>
            <button
              onClick={fetchSessions}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Fetching
            </button>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State View */
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-md mx-auto">
            <CalendarRange className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No study sessions found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {upcomingOnly 
                ? 'No upcoming study sessions - be the first to post one!' 
                : 'No past study sessions found for your selections.'}
            </p>
            {upcomingOnly && (
              <Link
                to="/student/study-sessions/create"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/10"
              >
                Create Study Session
              </Link>
            )}
          </div>
        ) : (
          /* Display Feed Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="sessions-feed-grid">
              {sessions.map((session) => (
                <StudySessionCard key={session.id} session={session} />
              ))}
            </div>

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Previous Page"
                  id="pagination-prev-btn"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Next Page"
                  id="pagination-next-btn"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseStudySessionsPage;
