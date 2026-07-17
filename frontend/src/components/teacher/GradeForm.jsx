import React, { useState, useEffect } from 'react';

const GradeForm = ({ initialGrade, initialFeedback, maxScore = 100, onSave, isSaving }) => {
  const [grade, setGrade] = useState(initialGrade !== null && initialGrade !== undefined ? initialGrade : '');
  const [feedback, setFeedback] = useState(initialFeedback || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setGrade(initialGrade !== null && initialGrade !== undefined ? initialGrade : '');
    setFeedback(initialFeedback || '');
  }, [initialGrade, initialFeedback]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (grade === '' || grade === null) {
      setError('Grade is required.');
      return;
    }
    const numGrade = Number(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > maxScore) {
      setError(`Grade must be between 0 and ${maxScore}.`);
      return;
    }

    onSave({ grade: numGrade, feedback });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Grading & Feedback</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
          Grade (out of {maxScore}) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="grade"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          min="0"
          max={maxScore}
          step="0.1"
          placeholder="Enter score"
          disabled={isSaving}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
          Feedback
        </label>
        <textarea
          id="feedback"
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave constructive notes for the student..."
          disabled={isSaving}
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Optional, but recommended for student improvement.</p>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className={`w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
          ${isSaving ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'} 
          transition-colors flex justify-center items-center`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          'Save Grade'
        )}
      </button>
    </form>
  );
};

export default GradeForm;
