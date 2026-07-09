import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Download } from 'lucide-react';
import clsx from 'clsx';

const CsvUploadZone = ({ onFileSelected }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateAndProcessFile = (file) => {
    setError('');
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    validateAndProcessFile(droppedFile);
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndProcessFile(selectedFile);
    // Reset input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4 animate-slide-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upload CSV File</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop your CSV file here, or click to browse.
          </p>
        </div>
        <a
          href="/templates/students_import_template.csv"
          download="students_import_template.csv"
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Template
        </a>
      </div>

      <div
        className={clsx(
          'relative w-full rounded-2xl border-2 border-dashed p-8 transition-colors duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center min-h-[240px]',
          isDragActive
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={0}
        aria-label="File upload zone"
      >
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleChange}
        />
        <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
          <UploadCloud
            className={clsx('h-8 w-8', isDragActive ? 'text-indigo-600' : 'text-gray-400')}
          />
        </div>
        <p className="text-gray-700 font-medium text-center">
          <span className="text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <FileText className="h-3 w-3" />
          CSV files only
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default CsvUploadZone;
