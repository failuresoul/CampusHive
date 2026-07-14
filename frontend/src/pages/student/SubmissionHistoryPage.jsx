import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMySubmissions } from '../../services/labTrackService';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import SubmissionList from '../../components/student/SubmissionList';
import axios from 'axios';

const SubmissionHistoryPage = () => {
  const { courseId } = useParams();
  const { token } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseTitle, setCourseTitle] = useState('Course');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getMySubmissions(courseId, token);
        setSubmissions(data.data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submission history.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCourse = async () => {
      try {
        // Fallback or actual fetch of course details to get the name
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

    if (courseId && token) {
      fetchHistory();
      fetchCourse();
    }
  }, [courseId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/student/courses" 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors self-start sm:self-auto"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold mb-1">
                <BookOpen className="w-4 h-4" />
                <span>{courseTitle}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Submission History
              </h1>
            </div>
          </div>
          
          <Link
            to={`/student/courses/${courseId}/labtrack/upload`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Submission
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
            {error}
          </div>
        )}

        <SubmissionList 
          submissions={submissions} 
          onDownloadError={(msg) => setError(msg)} 
        />
        
      </div>
    </div>
  );
};

export default SubmissionHistoryPage;
