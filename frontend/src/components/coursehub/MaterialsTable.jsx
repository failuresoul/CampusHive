import React from 'react';
import { 
  FileText, 
  Archive, 
  Trash2, 
  Download
} from 'lucide-react';

// Helper to get matching file icon
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-rose-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="w-5 h-5 text-amber-500" />;
    case 'zip':
      return <Archive className="w-5 h-5 text-purple-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const MaterialsTable = ({ materials, onDeleteClick }) => {
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0.00 MB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Title & Material</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Uploaded By</th>
              <th className="px-6 py-4">File Size</th>
              <th className="px-6 py-4">Upload Date</th>
              <th className="px-6 py-4 text-center">Downloads</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {materials.map((m) => (
              <tr 
                key={m.id} 
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                      {getFileIcon(m.originalFileName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-xs" title={m.title}>
                        {m.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5" title={m.originalFileName}>
                        {m.originalFileName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {m.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">
                      {(m.teacher?.name || 'T')[0]}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {m.teacher?.name || 'Assigned Teacher'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {formatSize(m.fileSize)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                  {formatDate(m.uploadedAt)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-bold text-gray-600 border border-gray-100">
                    <Download className="w-3.5 h-3.5" />
                    <span>{m.downloadCount ?? 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDeleteClick && onDeleteClick(m)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {materials.map((m) => (
          <div 
            key={m.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  {getFileIcon(m.originalFileName)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate" title={m.title}>
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5" title={m.originalFileName}>
                    {m.originalFileName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDeleteClick && onDeleteClick(m)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Delete Material"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-gray-50">
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Category</p>
                <span className="inline-flex px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700">
                  {m.category}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Uploader</p>
                <p className="font-semibold text-gray-700 truncate">
                  {m.teacher?.name || 'Teacher'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Size & Date</p>
                <p className="font-semibold text-gray-600">
                  {formatSize(m.fileSize)} • {formatDate(m.uploadedAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Downloads</p>
                <p className="font-bold text-gray-700 flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-gray-400" />
                  {m.downloadCount ?? 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsTable;
