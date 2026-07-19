import React from 'react';

const QuizPreLaunchSummary = ({ quiz, onStartQuiz }) => {
  if (!quiz) return null;

  const totalSeconds = quiz.questionCount * quiz.timeLimitPerQuestion;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto text-center mt-12">
      <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
      <p className="text-gray-500 mb-8">Review the quiz details before opening the waiting room for students.</p>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Questions</p>
          <p className="text-2xl font-bold text-gray-900">{quiz.questionCount}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Time per Q</p>
          <p className="text-2xl font-bold text-gray-900">{quiz.timeLimitPerQuestion}s</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Time</p>
          <p className="text-2xl font-bold text-gray-900">~{durationText}</p>
        </div>
      </div>

      <button
        onClick={onStartQuiz}
        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center mx-auto"
      >
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Open Waiting Room
      </button>
    </div>
  );
};

export default QuizPreLaunchSummary;
