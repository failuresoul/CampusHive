import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LiveLeaderboard from '../../components/quiz/LiveLeaderboard';
import OptionDistributionBar from '../../components/quiz/OptionDistributionBar';

// ════════════════════════════════════════════════════════════════════════════
// TODO: Connect to GET /api/quizzes/:quizId/analytics (teacher) in Story 11
// Replace mockAnalyticsData with real API response.
// ════════════════════════════════════════════════════════════════════════════

const mockAnalyticsData = {
  quizTitle: 'Data Structures — Midterm Quiz',
  status: 'closed', // 'launched' | 'closed'
  overallStats: {
    averageScore: 682,
    maxPossibleScore: 1000,
    totalEnrolled: 35,
    totalResponded: 28,
    completionRate: 80,   // percentage
    averageResponseTimeMs: 12400,
    totalQuestions: 5,
  },
  leaderboard: [
    { studentId: 'stu-1', name: 'Alice Smith', score: 980, rank: 1 },
    { studentId: 'stu-2', name: 'Bob Johnson', score: 920, rank: 2 },
    { studentId: 'stu-3', name: 'Charlie Brown', score: 880, rank: 3 },
    { studentId: 'stu-4', name: 'David Lee', score: 720, rank: 4 },
    { studentId: 'stu-5', name: 'Emma Watson', score: 710, rank: 5 },
    { studentId: 'stu-6', name: 'Frank Miller', score: 680, rank: 6 },
    { studentId: 'stu-7', name: 'Grace Hopper', score: 620, rank: 7 },
    { studentId: 'stu-8', name: 'Henry Ford', score: 580, rank: 8 },
    { studentId: 'stu-9', name: 'Ivy League', score: 540, rank: 9 },
    { studentId: 'stu-10', name: 'Jack Daniels', score: 510, rank: 10 },
    { studentId: 'stu-11', name: 'Karen White', score: 490, rank: 11 },
    { studentId: 'stu-12', name: 'Leo Davis', score: 460, rank: 12 },
  ],
  questionAnalytics: [
    {
      questionIndex: 0,
      questionText: 'Which data structure uses LIFO (Last In, First Out) principle?',
      totalResponses: 28,
      correctCount: 24,
      options: [
        { optionId: 'opt-1a', optionText: 'Queue', count: 2, isCorrect: false },
        { optionId: 'opt-1b', optionText: 'Stack', count: 24, isCorrect: true },
        { optionId: 'opt-1c', optionText: 'Linked List', count: 1, isCorrect: false },
        { optionId: 'opt-1d', optionText: 'Tree', count: 1, isCorrect: false },
      ],
    },
    {
      questionIndex: 1,
      questionText: 'What is the time complexity of binary search?',
      totalResponses: 28,
      correctCount: 22,
      options: [
        { optionId: 'opt-2a', optionText: 'O(n)', count: 4, isCorrect: false },
        { optionId: 'opt-2b', optionText: 'O(log n)', count: 22, isCorrect: true },
        { optionId: 'opt-2c', optionText: 'O(n²)', count: 1, isCorrect: false },
        { optionId: 'opt-2d', optionText: 'O(1)', count: 1, isCorrect: false },
      ],
    },
    {
      questionIndex: 2,
      questionText: 'Which traversal visits the root node first?',
      totalResponses: 27,
      correctCount: 18,
      options: [
        { optionId: 'opt-3a', optionText: 'In-order', count: 5, isCorrect: false },
        { optionId: 'opt-3b', optionText: 'Post-order', count: 2, isCorrect: false },
        { optionId: 'opt-3c', optionText: 'Pre-order', count: 18, isCorrect: true },
        { optionId: 'opt-3d', optionText: 'Level-order', count: 2, isCorrect: false },
      ],
    },
    {
      questionIndex: 3,
      questionText: 'What is the worst-case time complexity of Quick Sort?',
      totalResponses: 26,
      correctCount: 12,
      options: [
        { optionId: 'opt-4a', optionText: 'O(n log n)', count: 10, isCorrect: false },
        { optionId: 'opt-4b', optionText: 'O(n²)', count: 12, isCorrect: true },
        { optionId: 'opt-4c', optionText: 'O(n)', count: 2, isCorrect: false },
        { optionId: 'opt-4d', optionText: 'O(log n)', count: 2, isCorrect: false },
      ],
    },
    {
      questionIndex: 4,
      questionText: 'Which data structure is used for BFS (Breadth-First Search)?',
      totalResponses: 28,
      correctCount: 25,
      options: [
        { optionId: 'opt-5a', optionText: 'Stack', count: 2, isCorrect: false },
        { optionId: 'opt-5b', optionText: 'Queue', count: 25, isCorrect: true },
        { optionId: 'opt-5c', optionText: 'Priority Queue', count: 1, isCorrect: false },
        { optionId: 'opt-5d', optionText: 'Deque', count: 0, isCorrect: false },
      ],
    },
  ],
};

const TeacherQuizAnalyticsPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);

  useEffect(() => {
    // TODO: Replace with real API call in Story 11
    // GET /api/quizzes/:quizId/analytics
    const fetchAnalytics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 600));

        const data = mockAnalyticsData;

        // Handle "quiz still in progress" edge case
        if (data.status === 'launched') {
          setQuizInProgress(true);
          setLoading(false);
          return;
        }

        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch quiz analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [quizId, token]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium text-lg animate-pulse">Loading analytics...</p>
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
            This quiz is still live. Analytics will be available once the quiz session is closed.
          </p>
          <button
            onClick={() => navigate(`/teacher/courses/${courseId}/quizzes/${quizId}/launch`)}
            className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-lg shadow-lg mb-3"
          >
            Go to Live Session
          </button>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Analytics Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't load analytics for this quiz.</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  const { overallStats, leaderboard, questionAnalytics, quizTitle } = analytics;
  const avgResponseTimeSec = (overallStats.averageResponseTimeMs / 1000).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-300 hover:text-white text-sm font-medium flex items-center mb-6 transition-colors"
            id="back-from-analytics"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/30">
                Quiz Analytics
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-3">{quizTitle}</h1>
              <p className="text-indigo-300 text-sm font-medium mt-1">Detailed performance analytics</p>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-800/30 self-start sm:self-auto">
              ✓ Quiz Closed
            </span>
          </div>

          {/* Summary stat cards */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Avg. Score</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{overallStats.averageScore}</span>
              <span className="text-xs text-indigo-400 block mt-1">/ {overallStats.maxPossibleScore}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Completion</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{overallStats.completionRate}%</span>
              <span className="text-xs text-indigo-400 block mt-1">{overallStats.totalResponded}/{overallStats.totalEnrolled} students</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Avg. Time</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{avgResponseTimeSec}s</span>
              <span className="text-xs text-indigo-400 block mt-1">per question</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Questions</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{overallStats.totalQuestions}</span>
              <span className="text-xs text-indigo-400 block mt-1">total</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 block mb-1">Participants</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{overallStats.totalResponded}</span>
              <span className="text-xs text-indigo-400 block mt-1">submitted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Leaderboard (2/3 width on lg) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-5 flex items-center gap-2">
              🏆 Final Leaderboard
            </h2>
            <LiveLeaderboard
              leaderboardData={leaderboard}
              isTeacherView={true}
            />
          </div>

          {/* Right — Class performance summary */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-5">
              📈 Class Performance
            </h2>

            {/* Accuracy by question mini chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">Accuracy by Question</h3>
              <div className="flex flex-col gap-3">
                {questionAnalytics.map((q, idx) => {
                  const pct = q.totalResponses > 0
                    ? Math.round((q.correctCount / q.totalResponses) * 100)
                    : 0;

                  let barColor = 'from-emerald-400 to-emerald-500';
                  if (pct < 50) barColor = 'from-red-400 to-red-500';
                  else if (pct < 70) barColor = 'from-amber-400 to-amber-500';

                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-600">Q{idx + 1}</span>
                        <span className={`text-xs font-bold ${
                          pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Identify hardest question */}
              {questionAnalytics.length > 0 && (() => {
                const hardest = [...questionAnalytics].sort((a, b) => {
                  const pctA = a.totalResponses > 0 ? a.correctCount / a.totalResponses : 1;
                  const pctB = b.totalResponses > 0 ? b.correctCount / b.totalResponses : 1;
                  return pctA - pctB;
                })[0];
                const hardestPct = hardest.totalResponses > 0
                  ? Math.round((hardest.correctCount / hardest.totalResponses) * 100)
                  : 0;

                return (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-red-500 block mb-1">
                      ⚠ Hardest Question
                    </span>
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      Q{hardest.questionIndex + 1}: Only {hardestPct}% got it right
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{hardest.questionText}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Per-question option distribution */}
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-2">
            📊 Per-Question Analytics
          </h2>
          <div className="flex flex-col gap-6">
            {questionAnalytics.map((q, idx) => {
              const correctPct = q.totalResponses > 0
                ? Math.round((q.correctCount / q.totalResponses) * 100)
                : 0;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                  id={`question-analytics-${idx}`}
                >
                  {/* Question header */}
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                          Q{idx + 1}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{q.questionText}</h3>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          correctPct >= 70
                            ? 'bg-emerald-100 text-emerald-700'
                            : correctPct >= 50
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {correctPct}% correct
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">
                          {q.correctCount}/{q.totalResponses} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option distribution */}
                  <div className="p-5 sm:p-6">
                    <OptionDistributionBar
                      options={q.options}
                      totalResponses={q.totalResponses}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Return button */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-lg shadow-lg"
            id="return-to-teacher-dashboard"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherQuizAnalyticsPage;
