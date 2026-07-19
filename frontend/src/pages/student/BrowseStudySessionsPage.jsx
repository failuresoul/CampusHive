import React from 'react';
import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';

const BrowseStudySessionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-100 shadow-xl text-center">
        <BookMarked className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Sessions</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Browse page is under construction (Story 3). Your study session was saved successfully!
        </p>
        <Link
          to="/student/dashboard"
          className="inline-flex justify-center items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default BrowseStudySessionsPage;
