import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GradeForm from '../../components/teacher/GradeForm';
import { useAuth } from '../../context/AuthContext';
import { getTeacherSubmission, saveGrade } from '../../services/labTrackService';

const GradeSubmissionPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  // State for submission details and grading
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getTeacherSubmission(submissionId, token);
        if (response.success) {
          setSubmission(response.data);
        } else {
          setError(response.message || 'Failed to fetch submission.');
        }
      } catch (err) {
        console.error('Failed to fetch submission:', err);
        setError(err.response?.data?.message || 'Failed to fetch submission.');
      } finally {
        setLoading(false);
      }
    };

    if (token && submissionId) {
      fetchSubmission();
    }
  }, [submissionId, token]);

  const handleSaveGrade = async (gradeData) => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError('');
    
    try {
      const response = await saveGrade(submissionId, gradeData, token);
      if (response.success) {
        setSaveSuccess(true);
        setSubmission(prev => ({
          ...prev,
          grade: gradeData.grade,
          feedback: gradeData.feedback
        }));
        
        setTimeout(() => {
          navigate('/teacher/submissions');
        }, 1500);
      } else {
        setError(response.message || 'Failed to save grade.');
      }
    } catch (err) {
      console.error('Failed to save grade:', err);
      setError(err.response?.data?.message || 'Failed to save grade.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => navigate('/teacher/submissions')} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Queue
          </button>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-4">The submission you are looking for does not exist or you don't have access.</p>
          <button onClick={() => navigate('/teacher/submissions')} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/teacher/submissions')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back to Queue
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Grade Submission</h1>
            <p className="text-sm text-gray-500 mt-1">
              {submission.courseCode} - {submission.courseName}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Grade saved successfully! Redirecting...
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Context & Preview */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Submission Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="font-medium text-gray-900">{submission.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assignment</p>
                  <p className="font-medium text-gray-900">{submission.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted On</p>
                  <p className="font-medium text-gray-900">
                    {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-lg font-semibold text-gray-800">File Preview</h2>
                <a 
                  href={submission.fileUrl} 
                  download={submission.fileName}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download {submission.fileName}
                </a>
              </div>
              <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 border-dashed">
                {/* Embed or iframe would go here. For now, a placeholder */}
                <div className="text-center p-6">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  <p className="text-gray-500 mb-2">Preview not available for this file type in mockup.</p>
                  <p className="text-sm text-gray-400">Please download to view.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Grade Form */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-6">
              <GradeForm 
                initialGrade={submission.grade}
                initialFeedback={submission.feedback}
                maxScore={submission.maxScore}
                onSave={handleSaveGrade}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeSubmissionPage;
