import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  Users,
  LogOut,
  Bell,
  Upload,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CsvUploadZone from '../../components/admin/CsvUploadZone';
import CsvPreviewTable from '../../components/admin/CsvPreviewTable';
import { parseAndValidateCsv } from '../../utils/csvValidation';

const BulkImportPage = () => {
  const { user, logoutContext } = useAuth();
  const navigate = useNavigate();

  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleLogout = () => {
    logoutContext();
    navigate('/login');
  };

  const handleFileSelected = async (file) => {
    setIsProcessing(true);
    setImportSuccess(false);
    try {
      const results = await parseAndValidateCsv(file);
      setParsedRows(results);
    } catch (err) {
      console.error('Error parsing CSV:', err);
      // Optional: add a global error state here
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  const handleImport = async () => {
    if (validRows.length === 0) return;

    setIsImporting(true);

    try {
      // ─────────────────────────────────────────────────────────────────────
      // TODO: connect to POST /api/students/bulk-import in Story 4
      // ─────────────────────────────────────────────────────────────────────
      
      console.log('[BulkImportPage] Submitting valid rows to backend stub:');
      console.log(validRows.map(r => r.data));

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setImportSuccess(true);
      setParsedRows([]);
    } catch (err) {
      console.error('Import failed', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:inline">CampusHive</span>
            <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              Admin
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
            <li>
              <Link
                to="/admin/dashboard"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li>
              <Link
                to="/admin/students"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Students
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-gray-300" aria-hidden="true" />
            </li>
            <li className="text-gray-800 font-semibold" aria-current="page">
              Bulk Import
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 shadow-md flex-shrink-0">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Bulk Import Students
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload a CSV file to register multiple students at once.
            </p>
          </div>
        </div>

        {importSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-slide-up">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-800">Import Successful (Stub)</h3>
              <p className="text-sm text-emerald-700 mt-1">
                The students have been imported successfully. Check the console to see the logged payload.
              </p>
            </div>
            <button 
              onClick={() => setImportSuccess(false)}
              className="ml-auto text-emerald-600 hover:text-emerald-800 transition-colors text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 animate-slide-up mb-8">
          <CsvUploadZone onFileSelected={handleFileSelected} />
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-gray-600 font-medium">Processing CSV...</span>
          </div>
        )}

        {/* Preview Section */}
        {parsedRows.length > 0 && !isProcessing && (
          <div className="animate-slide-up space-y-6">
            {/* Summary Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium text-gray-700">
                    {validRows.length} valid row{validRows.length !== 1 && 's'}
                  </span>
                </div>
                {invalidRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                    <span className="text-sm font-medium text-red-600">
                      {invalidRows.length} row{invalidRows.length !== 1 && 's'} with errors
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleImport}
                disabled={validRows.length === 0 || isImporting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import {validRows.length} Student{validRows.length !== 1 && 's'}
                  </>
                )}
              </button>
            </div>
            
            {invalidRows.length > 0 && validRows.length > 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 inline-block">
                <strong>Note:</strong> Only valid rows will be imported. The {invalidRows.length} row(s) with errors will be skipped.
              </p>
            )}

            <CsvPreviewTable rows={parsedRows} maxRows={20} />
          </div>
        )}
      </main>
    </div>
  );
};

export default BulkImportPage;
