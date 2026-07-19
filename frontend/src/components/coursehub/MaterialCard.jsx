import React, { useState } from 'react';
import { 
  FileText, 
  Presentation, 
  FileArchive, 
  File, 
  Download, 
  Bookmark, 
  User, 
  Calendar 
} from 'lucide-react';

const getFileIcon = (fileType) => {
  const type = fileType?.toLowerCase() || '';
  if (type === 'pdf') {
    return {
      icon: FileText,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    };
  }
  if (['doc', 'docx'].includes(type)) {
    return {
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    };
  }
  if (['ppt', 'pptx'].includes(type)) {
    return {
      icon: Presentation,
      color: 'bg-orange-50 text-orange-600 border-orange-100',
    };
  }
  if (type === 'zip') {
    return {
      icon: FileArchive,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    };
  }
  return {
    icon: File,
    color: 'bg-gray-50 text-gray-600 border-gray-100',
  };
};

const formatSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0.00 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(2)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MaterialCard = ({ material, onDownloadClick }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { icon: Icon, color: iconColors } = getFileIcon(material.fileType);

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(prev => !prev);
    console.log(`[Story 7 Bookmark Stub] Toggled bookmark for material ID: ${material.id}`);
    // TODO: connect bookmark toggle to POST/DELETE /api/materials/:id/bookmark in Story 7
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDownloadClick) {
      onDownloadClick(material);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-amber-200/60 transition-all duration-300 flex flex-col group relative">
      
      {/* Top Section: Icon & Bookmark */}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl border ${iconColors} flex items-center justify-center shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <button
          onClick={handleBookmarkToggle}
          className={`p-2 rounded-xl transition-all duration-300 hover:bg-gray-50 ${
            isBookmarked 
              ? 'text-amber-500 scale-110' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Material'}
          aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Material'}
        >
          <Bookmark className={`w-5 h-5 transition-all ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Main Details */}
      <div className="flex-1 flex flex-col">
        {/* Category Tag */}
        <span className="inline-flex self-start px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-100 mb-2">
          {material.category || 'Lecture Notes'}
        </span>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 group-hover:text-amber-600 transition-colors">
          {material.title}
        </h3>

        {/* Description if available */}
        {material.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
            {material.description}
          </p>
        )}

        {/* Metadata Footer */}
        <div className="mt-auto pt-4 border-t border-gray-50 space-y-2 text-xs text-gray-500">
          {/* Uploader (Teacher) Name */}
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium truncate">
              {material.teacher?.name || 'Assigned Instructor'}
            </span>
          </div>

          {/* Date & Size */}
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(material.uploadedAt)}</span>
            </div>
            <span className="font-semibold text-gray-500">{formatSize(material.fileSize)}</span>
          </div>
        </div>
      </div>

      {/* Download Action Footer */}
      <div className="mt-4 pt-1">
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-amber-500 hover:text-white text-gray-700 text-sm font-semibold rounded-xl transition-all border border-gray-155 hover:border-amber-500 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default MaterialCard;
