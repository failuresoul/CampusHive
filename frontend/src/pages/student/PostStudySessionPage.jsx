import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyCourses } from '../../services/studentService';
import { createStudySession } from '../../services/studyCircleService';
import StudySessionForm from '../../components/studycircle/StudySessionForm';

const PostStudySessionPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // SEO: Title & Meta Description
  useEffect(() => {
    document.title = 'Post a Study Session | CampusHive';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Organize and post a collaborative study session for your enrolled courses on CampusHive.');
  }, []);

  // Fetch student's enrolled courses
  const fetchCourses = useCallback(async () => {
    setLoadingCourses(true);
    setError(null);
    try {
      const data = await getMyCourses(token);
      setCourses(data || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Could not fetch your enrolled courses. Please check your connection and try again.');
    } finally {
      setLoadingCourses(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCourses();
    }
  }, [token, fetchCourses]);

  // Form submission handler
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = {
      title: formData.title,
      courseId: formData.courseId,
      dateTime: formData.dateTime,
      location: formData.location,
      description: formData.description,
      maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : null
    };

    try {
      await createStudySession(payload, token);
      
      // On success, redirect to the Browse Study Posts view (Story 3)
      navigate('/student/study-sessions');
    } catch (err) {
      console.error('Error submitting study session form:', err);
      const errMsg = err.response?.data?.message || 'Failed to post study session. Please check your connection and try again.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmittedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
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
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Post a Study Session</h1>
              <p className="text-sm text-gray-500">Organize a collaborative review or group discussion with peers</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="p-6 sm:p-8">
            {isSuccess ? (
              /* Success View */
              <div className="text-center py-8 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-950 mb-2">Study Session Posted!</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  Your session <span className="font-semibold text-gray-800">"{submittedData?.title}"</span> has been created. Other students can now browse and RSVP to join.
                </p>

                {/* Submission Details Card */}
                <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left max-w-lg mx-auto border border-gray-100">
                  <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-3">Session Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <div>
                      <span className="block font-medium text-gray-500">Course:</span>
                      <span>{submittedData?.courseCode ? `${submittedData.courseCode} - ` : ''}{submittedData?.courseName}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-500">Date & Time:</span>
                      <span>{submittedData?.dateTime ? new Date(submittedData.dateTime).toLocaleString() : ''}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-500">Location:</span>
                      <span>{submittedData?.location}</span>
                    </div>
                    <div>
                      <span className="block font-medium text-gray-500">Capacity:</span>
                      <span>{submittedData?.maxParticipants ? `${submittedData.maxParticipants} students max` : 'Unlimited'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link
                    to="/student/dashboard"
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleReset}
                    className="inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                  >
                    Post Another Session
                  </button>
                </div>
              </div>
            ) : loadingCourses ? (
              /* Loading Skeleton */
              <div className="space-y-6 animate-pulse py-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded-xl"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded-xl"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-32 bg-gray-100 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl w-full mt-4"></div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Failed to Load Courses</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{error}</p>
                <button
                  onClick={fetchCourses}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Loading
                </button>
              </div>
            ) : courses.length === 0 ? (
              /* Empty Courses Warning */
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Enrolled Courses Found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  You must be enrolled in at least one course to organize a study session. Please contact your instructor or course administrator.
                </p>
                <Link
                  to="/student/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            ) : (
              /* Render Form */
              <div className="space-y-6">
                {submitError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-800 text-sm animate-slide-up" id="submit-error-banner">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Error creating session:</span> {submitError}
                    </div>
                  </div>
                )}
                <StudySessionForm
                  courses={courses}
                  onSubmit={handleFormSubmit}
                  isLoading={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PostStudySessionPage;
