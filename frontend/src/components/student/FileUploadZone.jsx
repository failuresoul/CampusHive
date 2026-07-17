import React, { useCallback } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const FileUploadZone = ({ file, setFile, error, setError }) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateAndSetFile = useCallback((selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
  }, [setError, setFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [validateAndSetFile]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX (max. {MAX_SIZE_MB}MB)
          </p>
        </div>
      ) : (
        <div className="bg-white border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
