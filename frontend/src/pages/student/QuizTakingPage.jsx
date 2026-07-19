import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuizSocket } from '../../hooks/useQuizSocket';
import QuizCountdownTimer from '../../components/student/QuizCountdownTimer';
import QuizQuestionDisplay from '../../components/student/QuizQuestionDisplay';

const QuizTakingPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // Use the global persistent socket connection for the student
  const socket = useQuizSocket();

  const [quizState, setQuizState] = useState('connecting'); // connecting, waiting, active, ended, error
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Submit and Reveal states
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedOptionId, setSubmittedOptionId] = useState(null);
  const [revealData, setRevealData] = useState(null);

  const submitAnswerREST = async (optionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}/questions/${currentQuestion.id}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ optionId })
      });
      const resData = await response.json();
      if (resData.success) {
        console.log('Answer recorded via REST fallback.');
        setHasSubmitted(true);
        setSubmittedOptionId(optionId);
        setIsLocked(true);
      } else {
        console.error('REST fallback answer submission failed:', resData.message);
        if (resData.message?.includes('already submitted') || resData.message?.includes('expired')) {
          setIsLocked(true);
          setHasSubmitted(true);
        } else {
          setIsLocked(false);
          setHasSubmitted(false);
          setSubmittedOptionId(null);
          alert(`Failed to submit: ${resData.message}`);
        }
      }
    } catch (err) {
      console.error('REST fallback error:', err);
      setIsLocked(false);
      setHasSubmitted(false);
      setSubmittedOptionId(null);
      alert('Network connection error. Failed to submit answer.');
    }
  };

  const handleSubmitAnswer = (optionId) => {
    if (isLocked || hasSubmitted) return;

    setIsLocked(true);
    setHasSubmitted(true);
    setSubmittedOptionId(optionId);

    if (socket && socket.connected) {
      // Primary: Socket submission
      socket.emit('submit-answer', {
        questionId: currentQuestion.id,
        optionId
      });
    } else {
      // Fallback: REST submission
      submitAnswerREST(optionId);
    }
  };

  useEffect(() => {
    if (!socket || !user) return;

    // Join the specific quiz session room
    socket.emit('join-quiz', {
      sessionId: quizId,
      studentId: user.id,
      courseId
    });

    const handleJoined = () => setQuizState('waiting');
    
    const handleSyncState = (data) => {
      // Reconnected mid-quiz
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeRemaining);
      
      if (data.reveal) {
        setRevealData(data.reveal);
        setSubmittedOptionId(data.reveal.selectedOptionId);
        setHasSubmitted(!!data.reveal.selectedOptionId);
        setIsLocked(true);
      } else {
        setRevealData(null);
        setSubmittedOptionId(null);
        setHasSubmitted(false);
        setIsLocked(data.timeRemaining <= 0);
      }
      
      setQuizState('active');
    };

    const handleQuestionStarted = (data) => {
      setCurrentQuestion(data.question);
      setTimeRemaining(data.timeLimit);
      setIsLocked(false);
      setHasSubmitted(false);
      setSubmittedOptionId(null);
      setRevealData(null);
      setQuizState('active');
    };

    const handleQuestionEnded = () => {
      setIsLocked(true);
      setTimeRemaining(0);
    };

    const handleQuizEnded = () => {
      setQuizState('ended');
    };

    const handleError = (data) => {
      setErrorMessage(data.message);
      setQuizState('error');
    };

    const handleAnswerReceived = (data) => {
      if (currentQuestion && data.questionId === currentQuestion.id) {
        setHasSubmitted(true);
        setSubmittedOptionId(data.optionId);
        setIsLocked(true);
      }
    };

    const handleQuestionReveal = (data) => {
      if (currentQuestion && data.questionId === currentQuestion.id) {
        setRevealData(data);
        setIsLocked(true);
      }
    };

    socket.on('joined-successfully', handleJoined);
    socket.on('sync-state', handleSyncState);
    socket.on('question-started', handleQuestionStarted);
    socket.on('question-ended', handleQuestionEnded);
    socket.on('quiz-ended', handleQuizEnded);
    socket.on('error', handleError);
    socket.on('answer-received', handleAnswerReceived);
    socket.on('question-reveal', handleQuestionReveal);

    return () => {
      socket.off('joined-successfully', handleJoined);
      socket.off('sync-state', handleSyncState);
      socket.off('question-started', handleQuestionStarted);
      socket.off('question-ended', handleQuestionEnded);
      socket.off('quiz-ended', handleQuizEnded);
      socket.off('error', handleError);
      socket.off('answer-received', handleAnswerReceived);
      socket.off('question-reveal', handleQuestionReveal);
    };
  }, [socket, user, courseId, quizId, currentQuestion]);

  if (quizState === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium text-lg animate-pulse">Connecting to session...</p>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-6">{errorMessage}</p>
          <button onClick={() => navigate('/student/dashboard')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (quizState === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-8 animate-bounce">
            <span className="text-4xl">⏳</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">You're in!</h2>
          <p className="text-xl text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
            Waiting for the teacher to start the quiz...
          </p>
        </div>
      </div>
    );
  }

  if (quizState === 'ended') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Quiz Complete!</h2>
          <p className="text-lg text-gray-500 mb-8">
            Great job! Scoring and results will be available soon (Sprint 7).
          </p>
          <button onClick={() => navigate('/student/dashboard')} className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors text-lg shadow-lg">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header with Timer */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-4 sm:px-6 sm:py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <QuizCountdownTimer initialTime={timeRemaining} isLocked={isLocked} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {currentQuestion ? (
            <>
              <QuizQuestionDisplay 
                question={currentQuestion} 
                isLocked={isLocked} 
                onSubmitAnswer={handleSubmitAnswer}
                revealData={revealData}
                submittedOptionId={submittedOptionId}
              />
              
              {/* Submission and Reveal Banners */}
              <div className="mt-8">
                {hasSubmitted && !revealData && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-700 font-semibold shadow-sm animate-pulse">
                    <svg className="w-5 h-5 mr-3 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Answer submitted, waiting for results...
                  </div>
                )}

                {revealData && (
                  <div className={`p-6 rounded-2xl border-2 shadow-sm transition-all duration-300 ${
                    revealData.selectedOptionId === null
                      ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
                      : revealData.isCorrect
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">
                        {revealData.selectedOptionId === null ? '⌛' : revealData.isCorrect ? '🎉' : '❌'}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold">
                          {revealData.selectedOptionId === null 
                            ? "Time's Up!" 
                            : revealData.isCorrect 
                              ? 'Correct! Well done.' 
                              : 'Incorrect.'}
                        </h3>
                        <p className="text-sm mt-1 opacity-90">
                          {revealData.selectedOptionId === null 
                            ? "You didn't submit an answer in time." 
                            : revealData.isCorrect 
                              ? 'You got this question right! Great job.' 
                              : 'Better luck on the next question!'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">Loading question...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizTakingPage;
