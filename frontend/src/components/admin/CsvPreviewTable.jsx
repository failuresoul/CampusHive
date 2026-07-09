import React from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const CsvPreviewTable = ({ rows, maxRows = 20 }) => {
  if (!rows || rows.length === 0) return null;

  const displayRows = rows.slice(0, maxRows);
  const remainingRows = rows.length - displayRows.length;

  return (
    <div className="w-full animate-slide-up mt-8">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Data Preview (First {displayRows.length} rows)
      </h3>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                  Row
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                  DOB
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Dept / Batch
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={clsx(
                    'transition-colors',
                    row.isValid ? 'hover:bg-gray-50' : 'bg-red-50/50'
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">
                    {row.originalIndex}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={clsx("font-medium", !row.data.name && "text-red-500")}>
                      {row.data.name || 'Missing Name'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={clsx(row.errors.includes('Missing email') || row.errors.includes('Invalid email format') ? "text-red-500 font-medium" : "text-gray-900")}>
                      {row.data.email || 'Missing Email'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={clsx(!row.data.dob && "text-red-500")}>
                      {row.data.dob || 'Missing DOB'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className={clsx("text-xs font-medium", !row.data.department ? "text-red-500" : "text-indigo-600")}>
                        {row.data.department || 'No Dept'}
                      </span>
                      <span className={clsx("text-xs", !row.data.batch ? "text-red-500" : "text-gray-500")}>
                        {row.data.batch || 'No Batch'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {row.data.phone || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Error descriptions for invalid rows in the preview */}
        {displayRows.some(row => !row.isValid) && (
          <div className="bg-red-50 px-4 py-3 border-t border-red-100 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-red-800 uppercase flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Errors in previewed rows:
            </h4>
            <ul className="text-xs text-red-700 space-y-1">
              {displayRows.filter(r => !r.isValid).map((r, i) => (
                <li key={i}>
                  <span className="font-semibold">Row {r.originalIndex}:</span> {r.errors.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {remainingRows > 0 && (
        <p className="text-center text-sm text-gray-500 mt-4 italic">
          + {remainingRows} more row{remainingRows > 1 ? 's' : ''} not shown
        </p>
      )}
    </div>
  );
};

export default CsvPreviewTable;
