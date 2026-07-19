import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { getQuizDetails, launchQuiz, getLeaderboard } from '../../services/quizService';
import QuizPreLaunchSummary from '../../components/teacher/QuizPreLaunchSummary';
import QuizWaitingRoom from '../../components/teacher/QuizWaitingRoom';
import LiveLeaderboard from '../../components/quiz/LiveLeaderboard';

const QuizLaunchPage = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stage, setStage] = useState('summary'); // 'summary' | 'waiting-room' | 'live' | 'ended'
  
  // WebSocket and Session state
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Live session state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionActive, setQuestionActive] = useState(false);
  const [studentsJoined, setStudentsJoined] = useState(0);
  const [leaderboardData, setLeaderboardData] = useState([]);

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

  // Handle socket listeners setup when socket connects
  useEffect(() => {
    if (!socket) return;

    socket.on('participant-update', (data) => {
      setStudentsJoined(data.count);
    });

    socket.on('question-started', (data) => {
      setCurrentQuestion(data.question);
      setCurrentQuestionIndex(data.questionIndex);
      setTimeRemaining(data.timeLimit);
      setQuestionActive(true);
      setStage('live');
    });

    socket.on('question-ended', () => {
      setQuestionActive(false);
      setTimeRemaining(0);
    });

    socket.on('quiz-ended', () => {
      setStage('ended');
    });

    socket.on('leaderboard-update', (data) => {
      setLeaderboardData(data);
    });

    // Fetch current leaderboard on (re)connect as resync fallback (Story 9)
    const fetchInitialLeaderboard = async () => {
      try {
        const res = await getLeaderboard(quizId, token);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setLeaderboardData(res.data);
        }
      } catch (err) {
        // Not critical — live socket updates will fill it in
        console.error('Failed to fetch initial leaderboard:', err);
      }
    };
    fetchInitialLeaderboard();

    return () => {
      socket.off('participant-update');
      socket.off('question-started');
      socket.off('question-ended');
      socket.off('quiz-ended');
      socket.off('leaderboard-update');
    };
  }, [socket, quizId, token]);

  // Authority teacher-side countdown ticker
  useEffect(() => {
    if (!questionActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questionActive, timeRemaining]);

  const handleStartQuiz = async () => {
    try {
      const response = await launchQuiz(courseId, quizId, token);
      if (response.success) {
        const returnedSessionId = response.data.sessionId;
        setSessionId(returnedSessionId);

        // Connect WebSocket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('teacher-join', {
          sessionId: returnedSessionId,
          courseId,
          token
        });

        // Transition from summary to waiting room
        setStage('waiting-room');
      }
    } catch (err) {
      alert(err.message || 'Failed to launch quiz.');
    }
  };

  const handleBeginFirstQuestion = () => {
    if (socket && sessionId) {
      socket.emit('start-question', { sessionId, questionIndex: 0 });
    }
  };

  const handleEndQuestion = () => {
    if (socket && sessionId) {
      socket.emit('end-question', { sessionId });
    }
  };

  const handleNextQuestion = () => {
    if (socket && sessionId) {
      socket.emit('start-question', { sessionId, questionIndex: currentQuestionIndex + 1 });
    }
  };

  const handleEndQuiz = () => {
    if (socket && sessionId) {
      socket.emit('quiz-ended', { sessionId });
    }
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
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mr-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Back
            </button>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Launch Quiz</h1>
          </div>
          {stage === 'live' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 font-extrabold text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-sm animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span>
              Live Quiz Session
            </div>
          )}
        </div>

        {/* Content based on stage */}
        {stage === 'summary' && (
          <QuizPreLaunchSummary quiz={quiz} onStartQuiz={handleStartQuiz} />
        )}

        {stage === 'waiting-room' && (
          <QuizWaitingRoom 
            quiz={quiz} 
            onBeginQuiz={handleBeginFirstQuestion} 
            socket={socket} 
          />
        )}

        {stage === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
            {/* Left: Active Question status */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      Question {currentQuestionIndex + 1} of {quiz.questionCount}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mt-3">
                      {currentQuestion?.text || 'Loading Question...'}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex h-3 w-3 relative mb-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${questionActive ? 'bg-red-400' : 'bg-gray-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${questionActive ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                    </span>
                    <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-widest">
                      {questionActive ? 'Live' : 'Ended'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {currentQuestion?.options.map((option) => (
                    <div
                      key={option.id}
                      className="p-5 rounded-xl border border-gray-200 bg-gray-50/55 flex items-center"
                    >
                      <div className="w-5 h-5 rounded-full border border-gray-300 mr-3 flex-shrink-0 flex items-center justify-center bg-white shadow-inner">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      </div>
                      <span className="text-gray-700 font-medium">{option.optionText}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Waiting screen when active */}
              {questionActive ? (
                <div className="bg-indigo-900 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden min-h-[280px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-400 border-t-white animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold mb-2">Question is currently active</h3>
                    <p className="text-indigo-200 text-sm max-w-sm">
                      Students are submitting their answers. Click the "End Question" button below to stop submissions immediately.
                    </p>
                  </div>
                </div>
              ) : (
                /* Leaderboard when ended */
                <LiveLeaderboard 
                  leaderboardData={leaderboardData} 
                  isTeacherView={true} 
                  socket={socket}
                />
              )}
            </div>

            {/* Right Side: Control panel */}
            <div className="flex flex-col gap-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Session Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Connected</span>
                    <span className="text-3xl font-black text-indigo-600">{studentsJoined}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                    <span className="text-2xs font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Time Left</span>
                    <span className={`text-3xl font-black ${timeRemaining <= 5 && questionActive ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                      {timeRemaining}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-4">Session Controls</h3>
                
                {questionActive ? (
                  <button
                    onClick={handleEndQuestion}
                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                  >
                    End Question Early
                  </button>
                ) : (
                  <>
                    {currentQuestionIndex + 1 < quiz.questionCount ? (
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        Start Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleEndQuiz}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                      >
                        End & Close Quiz
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {stage === 'ended' && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-lg mx-auto text-center relative overflow-hidden mt-12">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Quiz Closed</h2>
            <p className="text-lg text-gray-500 mb-8">
              The quiz session has been closed successfully. All responses have been saved. You can now view detailed participant scores and option choice analytics.
            </p>
            <button 
              onClick={() => navigate(`/teacher/courses/${courseId}/quizzes/${quizId}/results`)} 
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors text-lg shadow-lg mb-3"
            >
              View Quiz Analytics
            </button>
            <button 
              onClick={() => navigate(`/teacher/courses/${courseId}/quizzes`)} 
              className="w-full px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors text-lg"
            >
              Return to Quizzes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizLaunchPage;
