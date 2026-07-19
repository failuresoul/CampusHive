import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getQuizDetails } from '../../services/quizService';
import QuizPreLaunchSummary from '../../components/teacher/QuizPreLaunchSummary';
import QuizWaitingRoom from '../../components/teacher/QuizWaitingRoom';

const QuizLaunchPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('summary'); // 'summary' | 'waiting-room' | 'live'

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const response = await getQuizDetails(courseId, quizId, token);
        if (response.success) {
          setQuiz(response.data);
        } else {
          setError(response.message || 'Failed to fetch quiz details.');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch quiz details.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [courseId, quizId, token]);

  const handleStartQuiz = () => {
    // Transition from summary to waiting room
    setStage('waiting-room');
  };

  const handleBeginFirstQuestion = () => {
    // TODO: connect to POST /api/courses/:courseId/quizzes/:quizId/launch and WebSocket session join events in Story 4
    console.log('Transitioning to Live Quiz Mechanics (Story 4). Mock start.');
    alert('Real-time mechanics (Story 4) will begin here!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Quiz not found.'}</p>
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mr-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Launch Quiz</h1>
        </div>

        {/* Content based on stage */}
        {stage === 'summary' && (
          <QuizPreLaunchSummary quiz={quiz} onStartQuiz={handleStartQuiz} />
        )}

        {stage === 'waiting-room' && (
          <QuizWaitingRoom quiz={quiz} onBeginQuiz={handleBeginFirstQuestion} />
        )}

      </div>
    </div>
  );
};

export default QuizLaunchPage;
