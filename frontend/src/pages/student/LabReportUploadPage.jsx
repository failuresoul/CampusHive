import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import FileUploadZone from '../../components/student/FileUploadZone';

const LabReportUploadPage = () => {
  const { courseId } = useParams();
  

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    // Stub fetch course details for header
    setCourse({
      id: courseId,
      code: 'CS101',
      title: 'Introduction to Programming',
    });
  }, [courseId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // TODO: connect to POST /api/courses/:courseId/lab-reports in Story 4 (multipart/form-data)
      /* 
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', file);
      api.post(`/api/courses/${courseId}/lab-reports`, formData) 
      */
      
    }, 2500);
  };

  if (!course) return null;

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-gray-500 mb-8">
            Your lab report for {course.code} has been submitted successfully.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSuccess(false);
                setFile(null);
                setTitle('');
                setDescription('');
                setUploadProgress(0);
              }}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Submit Another
            </button>
            <Link
              to="/student/courses"
              className="w-full inline-block py-2.5 px-4 bg-amber-500 rounded-lg text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link 
            to="/student/courses" 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold mb-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.code}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Submit Lab Report
            </h1>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2.5"
                  placeholder="e.g., Lab 1: Kinematics"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm border p-2.5 resize-none"
                  placeholder="Add any notes for your teacher..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <FileUploadZone
                  file={file}
                  setFile={setFile}
                  error={fileError}
                  setError={setFileError}
                />
              </div>

              {/* Progress Bar */}
              {isSubmitting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-700">Uploading...</span>
                    <span className="text-amber-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-200 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <Link
                  to="/student/courses"
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !file}
                  className="px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LabReportUploadPage;
