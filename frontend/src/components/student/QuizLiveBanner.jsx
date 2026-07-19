import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizSocket } from '../../hooks/useQuizSocket';

const QuizLiveBanner = () => {
  const socket = useQuizSocket();
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleQuizLive = (data) => {
      // data: { courseId, quizId, courseName, quizTitle }
      setActiveQuiz(data);
    };

    socket.on('quiz-live', handleQuizLive);

    return () => {
      socket.off('quiz-live', handleQuizLive);
    };
  }, [socket]);

  if (!activeQuiz) return null;

  const handleJoin = () => {
    navigate(`/student/courses/${activeQuiz.courseId}/quizzes/${activeQuiz.quizId}/take`);
    setActiveQuiz(null); // Dismiss after navigating
  };

  const handleDismiss = () => {
    setActiveQuiz(null);
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-lg shadow-2xl rounded-xl overflow-hidden bg-white border border-indigo-100 flex shadow-indigo-500/10">
      <div className="bg-indigo-600 w-2 shrink-0"></div>
      <div className="p-4 flex-1 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            Live Now • {activeQuiz.courseName}
          </p>
          <h3 className="text-gray-900 font-bold text-base leading-tight">
            {activeQuiz.quizTitle}
          </h3>
        </div>
        <div className="flex items-center space-x-3 ml-4">
          <button 
            onClick={handleJoin}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
          >
            Join Now
          </button>
          <button 
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizLiveBanner;
