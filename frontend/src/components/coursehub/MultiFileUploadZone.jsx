import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed'
];
const MAX_SIZE_MB = 25;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const MultiFileUploadZone = ({ onFilesSelected, isSubmitting }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const validateFiles = useCallback((fileList) => {
    const valid = [];
    const rejected = [];

    Array.from(fileList).forEach((file) => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      const isValidExtension = ALLOWED_EXTENSIONS.includes(extension);
      const isValidMime = ALLOWED_MIME_TYPES.includes(file.type);
      
      // Check validation
      if (!isValidExtension && !isValidMime) {
        rejected.push({
          name: file.name,
          size: file.size,
          error: 'Unsupported file format. Please upload PDF, Word, PowerPoint, or ZIP files.'
        });
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        rejected.push({
          name: file.name,
          size: file.size,
          error: `File exceeds the maximum size limit of ${MAX_SIZE_MB}MB.`
        });
        return;
      }

      // Valid file
      const cleanedTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      valid.push({
        id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
        file,
        title: cleanedTitle,
        category: 'Lecture Notes',
        description: '',
        progress: 0,
        status: 'pending',
        error: null
      });
    });

    onFilesSelected(valid, rejected);
  }, [onFilesSelected]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (isSubmitting) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFiles(e.dataTransfer.files);
    }
  }, [validateFiles, isSubmitting]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFiles(e.target.files);
      // Clear input so same file can be uploaded again if removed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerInputClick = () => {
    if (fileInputRef.current && !isSubmitting) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer text-center group ${
          isSubmitting ? 'bg-gray-100 border-gray-200 cursor-not-allowed' :
          isDragActive 
            ? 'bg-emerald-50/70 border-emerald-500 scale-[1.01] shadow-md shadow-emerald-500/10' 
            : 'bg-white border-gray-300 hover:bg-gray-50/80 hover:border-emerald-500 hover:shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          disabled={isSubmitting}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed"
        />

        <div className={`w-14 h-14 bg-gray-50 rounded-2xl shadow-inner flex items-center justify-center mb-4 transition-all duration-300 ${
          isDragActive ? 'bg-emerald-100 scale-110 text-emerald-600' : 'text-gray-400 group-hover:scale-105 group-hover:text-emerald-500 group-hover:bg-emerald-50'
        }`}>
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="text-base font-semibold text-gray-800 mb-1">
          {isDragActive ? 'Drop your files here!' : 'Drag & drop your files here, or click to browse'}
        </p>
        
        <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
          Supports <span className="font-medium text-gray-700">PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), and ZIP</span> archives up to <span className="font-semibold text-emerald-600">{MAX_SIZE_MB}MB</span> per file.
        </p>
      </div>
    </div>
  );
};

export default MultiFileUploadZone;
