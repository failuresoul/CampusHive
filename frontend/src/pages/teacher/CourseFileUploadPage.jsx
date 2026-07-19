import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  AlertCircle, 
  Archive, 
  HelpCircle,
  X
} from 'lucide-react';
import MultiFileUploadZone from '../../components/coursehub/MultiFileUploadZone';

// Helper to get matching file icon
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-8 h-8 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-8 h-8 text-blue-500" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="w-8 h-8 text-amber-500" />;
    case 'zip':
      return <Archive className="w-8 h-8 text-purple-500" />;
    default:
      return <HelpCircle className="w-8 h-8 text-gray-500" />;
  }
};

const CourseFileUploadPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Component & Page State
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Mock fetch course details on load
  useEffect(() => {
    // Stub fetch course details for header
    setCourse({
      id: courseId,
      code: 'CSE-3106',
      title: 'Web Programming',
    });
  }, [courseId]);

  // Handle addition of files from upload zone
  const handleFilesSelected = (newValidFiles, newRejectedFiles) => {
    setGeneralError(null);
    setFiles((prev) => [...prev, ...newValidFiles]);
    setRejectedFiles((prev) => [...prev, ...newRejectedFiles]);
  };

  // Remove valid file before upload
  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  // Dismiss rejected file alert
  const handleDismissRejected = (indexToRemove) => {
    setRejectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle edit of title, category, description for individual files
  const handleMetaChange = (id, field, value) => {
    setFiles((prev) => 
      prev.map((file) => {
        if (file.id === id) {
          const updated = { ...file, [field]: value };
          // Clear error if title is fixed
          if (field === 'title' && value.trim()) {
            updated.error = null;
          }
          return updated;
        }
        return file;
      })
    );
  };

  // Validation before simulated upload
  const validateForms = () => {
    let isValid = true;
    const updatedFiles = files.map((file) => {
      if (!file.title.trim()) {
        isValid = false;
        return { ...file, error: 'Title is required.' };
      }
      return file;
    });

    if (!isValid) {
      setFiles(updatedFiles);
      setGeneralError('Please resolve all validation errors before uploading.');
    }
    return isValid;
  };

  // Stub handleUpload
  const handleUpload = async (_formDataArray) => {
    // TODO: connect to POST /api/courses/:courseId/materials in Story 2 (multipart/form-data, potentially one request per file or a batch endpoint — document assumption, batch preferred)
    // Assumption: The backend will accept a batch multipart/form-data upload. If batch is not supported, 
    // we would map files to individual API POST requests in parallel or sequence. Batch is preferred for atomic transactions.
    
    // Simulate upload latency
    return new Promise((resolve) => setTimeout(resolve, 500));
  };

  // Start upload simulation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (files.length === 0) {
      setGeneralError('Please select at least one file to upload.');
      return;
    }

    if (!validateForms()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate progress per-file
    const simulationIntervals = files.map((file) => {
      let progress = 0;
      file.status = 'uploading';
      file.progress = 0;

      return setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          progress = 100;
          file.progress = 100;
          file.status = 'success';
          setFiles((prev) => 
            prev.map((f) => f.id === file.id ? { ...f, progress: 100, status: 'success' } : f)
          );
        } else {
          file.progress = progress;
          setFiles((prev) => 
            prev.map((f) => f.id === file.id ? { ...f, progress } : f)
          );
        }
      }, Math.floor(Math.random() * 200) + 150);
    });

    // Wait until all timers finish
    const checkCompletionInterval = setInterval(async () => {
      const allComplete = files.every((f) => f.progress === 100);
      if (allComplete) {
        clearInterval(checkCompletionInterval);
        simulationIntervals.forEach((intervalId) => clearInterval(intervalId));

        // Package data for handleUpload stub
        const formDataArray = files.map((f) => {
          const data = new FormData();
          data.append('file', f.file);
          data.append('title', f.title);
          data.append('category', f.category);
          data.append('description', f.description);
          return data;
        });

        // Trigger stub
        await handleUpload(formDataArray);

        setIsSubmitting(false);
        setIsSuccess(true);
      }
    }, 100);
  };

  const handleReset = () => {
    setFiles([]);
    setRejectedFiles([]);
    setIsSuccess(false);
    setIsSubmitting(false);
    setGeneralError(null);
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 max-w-2xl w-full text-center transform hover:scale-[1.01] transition-transform duration-300">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Upload Complete!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Successfully uploaded <span className="font-semibold text-emerald-600">{files.length}</span> course material{files.length > 1 ? 's' : ''} to <span className="font-semibold text-gray-800">{course.code}</span>.
          </p>

          {/* Uploaded materials summary */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-8 text-left max-h-60 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Uploaded Files</h3>
            <div className="space-y-3">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  {getFileIcon(f.file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{f.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full">
                        {f.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Upload More Materials
            </button>
            <Link
              to="/teacher/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors shadow-md shadow-emerald-600/10 text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{course.code} • {course.title}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Upload Learning Materials
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Validation Error Banner */}
        {generalError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{generalError}</span>
          </div>
        )}

        {/* File Dropzone */}
        <div className="mb-8">
          <MultiFileUploadZone 
            onFilesSelected={handleFilesSelected} 
            isSubmitting={isSubmitting} 
          />
        </div>

        {/* Rejected Files Alerts */}
        {rejectedFiles.length > 0 && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                Rejected Files ({rejectedFiles.length})
              </h3>
            </div>
            <div className="space-y-2">
              {rejectedFiles.map((f, idx) => (
                <div 
                  key={idx} 
                  className="bg-red-50/60 border border-red-100 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600 flex-shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{f.name}</p>
                      <p className="text-xs text-red-600 font-medium mt-0.5">{f.error}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDismissRejected(idx)}
                    className="p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Container */}
        {files.length > 0 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-gray-800">
                Selected Files ({files.length})
              </h2>
              <button
                type="button"
                onClick={() => setFiles([])}
                disabled={isSubmitting}
                className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* List of files with inputs */}
            <div className="space-y-4">
              {files.map((fileEntry) => {
                const isUploading = fileEntry.status === 'uploading';
                const isSuccess = fileEntry.status === 'success';

                return (
                  <div 
                    key={fileEntry.id} 
                    className={`bg-white border rounded-2xl p-6 transition-all duration-300 shadow-sm relative overflow-hidden ${
                      fileEntry.error ? 'border-red-300 ring-2 ring-red-100' : 
                      isSuccess ? 'border-emerald-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Simulated Upload Overlay background */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-emerald-50/10 pointer-events-none" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* File Icon */}
                      <div className="p-3 bg-gray-50 rounded-xl flex-shrink-0">
                        {getFileIcon(fileEntry.file.name)}
                      </div>

                      {/* File Forms */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title input */}
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Document Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={fileEntry.title}
                            onChange={(e) => handleMetaChange(fileEntry.id, 'title', e.target.value)}
                            disabled={isSubmitting}
                            className={`w-full rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                              fileEntry.error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g. Week 5 Lecture Slides"
                          />
                          {fileEntry.error && (
                            <p className="mt-1.5 text-xs font-semibold text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {fileEntry.error}
                            </p>
                          )}
                        </div>

                        {/* Category Dropdown */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Category
                          </label>
                          <select
                            value={fileEntry.category}
                            onChange={(e) => handleMetaChange(fileEntry.id, 'category', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all"
                          >
                            <option value="Lecture Notes">Lecture Notes</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Reference">Reference</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        {/* File Size Information */}
                        <div className="flex flex-col justify-end">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            File Metadata
                          </span>
                          <div className="text-xs text-gray-600 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                            <span className="truncate max-w-[200px]">{fileEntry.file.name}</span>
                            <span className="font-semibold text-emerald-600 flex-shrink-0">
                              {(fileEntry.file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        {/* Optional Description */}
                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>
                          <textarea
                            rows={2}
                            value={fileEntry.description}
                            onChange={(e) => handleMetaChange(fileEntry.id, 'description', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                            placeholder="Add brief details about the material..."
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileEntry.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                          title="Remove file"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Progress Bar (during simulated uploading) */}
                    {isUploading && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1.5">
                          <span className="text-emerald-600 animate-pulse">Uploading file...</span>
                          <span>{fileEntry.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-150 ease-out shadow-sm" 
                            style={{ width: `${fileEntry.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Individual upload success marker */}
                    {isSuccess && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions Bar */}
            <div className="pt-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-5 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px] shadow-md shadow-emerald-600/10 transition-all hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Materials'
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default CourseFileUploadPage;
