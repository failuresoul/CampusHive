import React, { useCallback, useState } from 'react';
import { UploadCloud, Image, X, AlertCircle } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const PhotoUploadPreview = ({ file, setFile, error, setError }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  // Clean up object URL when component unmounts or file changes
  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const validateAndSetFile = useCallback((selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
  }, [setError, setFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

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
          className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-primary-400 transition-colors cursor-pointer group"
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
          />
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
            <UploadCloud className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF or WEBP (max. {MAX_SIZE_MB}MB)
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative group/preview">
          <div className="relative aspect-video w-full bg-gray-50 flex items-center justify-center p-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Upload preview"
                className="object-contain w-full h-full max-h-[240px] rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <Image className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Loading Preview...</span>
              </div>
            )}
            
            {/* Absolute overlay button to remove image */}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full shadow-md transition-all duration-200 focus:outline-none backdrop-blur-sm"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="overflow-hidden pr-4">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-bounce" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadPreview;
