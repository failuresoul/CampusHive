import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyQuizResults } from '../../services/quizService';
import QuestionBreakdown from '../../components/quiz/QuestionBreakdown';

const StudentQuizResultsPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getMyQuizResults(quizId, token);

        if (res.success) {
          // Handle "quiz still in progress" edge case
          if (res.status && res.status !== 'closed') {
            setQuizInProgress(true);
            setLoading(false);
            return;
          }

          setResults(res.data);
        } else {
          console.error('Failed to fetch quiz results:', res.message);
        }
      } catch (err) {
        console.error('Failed to fetch quiz results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId, token]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium text-lg animate-pulse">Loading results...</p>
      </div>
    );
  }

  // ── Quiz still in progress ─────────────────────────────────────────────
  if (quizInProgress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400"></div>
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Quiz Still in Progress</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This quiz hasn't ended yet. Results will be available once the teacher closes the quiz session.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-lg shadow-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Results Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load the results for this quiz.</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  const { studentResult, questions, quizTitle, totalParticipants } = results;
  const accuracy = studentResult.totalQuestions > 0
    ? Math.round((studentResult.correctCount / studentResult.totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          {/* Back button */}
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-indigo-300 hover:text-white text-sm font-medium flex items-center mb-6 transition-colors"
            id="back-to-dashboard"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{quizTitle}</h1>
          <p className="text-indigo-300 text-sm font-medium">Your personal quiz results</p>

          {/* Score hero card */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Rank */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Rank</span>
              <span className="text-3xl sm:text-4xl font-black text-white">#{studentResult.rank}</span>
              <span className="text-xs text-indigo-400 block mt-1">of {totalParticipants}</span>
            </div>
            {/* Score */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Score</span>
              <span className="text-3xl sm:text-4xl font-black text-white">{studentResult.totalScore}</span>
              <span className="text-xs text-indigo-400 block mt-1">/ {studentResult.maxPossibleScore}</span>
            </div>
            {/* Correct */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Correct</span>
              <span className="text-3xl sm:text-4xl font-black text-white">{studentResult.correctCount}</span>
              <span className="text-xs text-indigo-400 block mt-1">of {studentResult.totalQuestions}</span>
            </div>
            {/* Accuracy */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Accuracy</span>
              <span className="text-3xl sm:text-4xl font-black text-white">{accuracy}%</span>
              <span className="text-xs text-indigo-400 block mt-1">
                {accuracy >= 80 ? 'Excellent!' : accuracy >= 60 ? 'Good job!' : 'Keep studying'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4 relative z-10">
        <div className={`p-5 rounded-2xl border-2 shadow-sm ${
          accuracy >= 80
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : accuracy >= 50
              ? 'border-blue-200 bg-blue-50 text-blue-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
            </span>
            <div>
              <h3 className="text-lg font-bold">
                You got {studentResult.correctCount} out of {studentResult.totalQuestions} correct!
              </h3>
              <p className="text-sm opacity-80 mt-0.5">
                {accuracy >= 80
                  ? 'Outstanding performance! You clearly mastered this material.'
                  : accuracy >= 50
                    ? 'Solid effort! Review the questions you missed to improve.'
                    : 'Don\'t give up! Review the material and try again next time.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            📝 Question Breakdown
          </h2>
          <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            {questions.length} Questions
          </span>
        </div>

        <QuestionBreakdown questions={questions} />

        {/* Return button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-lg shadow-lg"
            id="return-to-dashboard"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizResultsPage;
