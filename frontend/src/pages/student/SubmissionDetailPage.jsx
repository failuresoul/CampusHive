import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSubmissionDetail, downloadLabReport } from '../../services/labTrackService';
import { ArrowLeft, BookOpen, Clock, CheckCircle, Download, FileText } from 'lucide-react';
import axios from 'axios';

const SubmissionDetailPage = () => {
  const { courseId, submissionId } = useParams();
  const { token } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState('Course');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getSubmissionDetail(courseId, submissionId, token);
        setSubmission(data.data);
      } catch (err) {
        console.error('Error fetching submission detail:', err);
        setError('Failed to load submission details. You might not have permission.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const course = response.data.data.find(c => c.id.toString() === courseId);
        if (course) {
          setCourseTitle(course.code);
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (courseId && submissionId && token) {
      fetchDetail();
      fetchCourse();
    }
  }, [courseId, submissionId, token]);

  const handleDownload = async () => {
    if (!submission) return;
    try {
      await downloadLabReport(courseId, submission.id, token, submission.originalFileName);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file. It may have been removed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center max-w-md w-full">
          <p className="text-red-600 mb-4">{error || 'Submission not found.'}</p>
          <Link
            to={`/student/courses/${courseId}/labtrack/history`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link 
            to={`/student/courses/${courseId}/labtrack/history`}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>{courseTitle}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.title || 'Untitled Report'}
            </h1>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* File Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Submission Details</h2>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {submission.originalFileName}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              </div>

              {submission.description && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Notes:</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
                    {submission.description}
                  </p>
                </div>
              )}
            </div>

            {/* Feedback Section (If Graded) */}
            {submission.status === 'graded' && (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <CheckCircle className="w-32 h-32 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 relative z-10">Instructor Feedback</h2>
                <div className="relative z-10 prose prose-sm text-gray-700">
                  {submission.feedback ? (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {submission.feedback}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">No additional feedback provided.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Status
              </h3>
              
              {submission.status === 'graded' ? (
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-6">
                    <CheckCircle className="w-4 h-4" />
                    Graded
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500 mb-1">Final Grade</p>
                    <div className="text-4xl font-extrabold text-gray-900">
                      {submission.grade || '-'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Pending Grading</h4>
                  <p className="text-sm text-gray-500">
                    Your instructor has not yet graded this submission.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SubmissionDetailPage;
