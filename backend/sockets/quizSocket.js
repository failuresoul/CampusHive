const { Quiz, QuizQuestion, QuizOption, Enrollment, QuizResponse } = require('../models/associations');
const { quizzes, submitAnswer } = require('../services/quizSessionService');
const { computeLeaderboard } = require('../services/leaderboardService');

module.exports = (io) => {
  // Helper to reveal correct answers and personal scores after a question ends
  const revealResults = async (sessionId) => {
    const state = quizzes[sessionId];
    if (!state) return;
    
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const correctOption = await QuizOption.findOne({
        where: { questionId: currentQuestion.id, isCorrect: true }
      });
      const correctOptionId = correctOption ? correctOption.id : null;

      // Broadcast correct answer to the room
      io.to(`quiz_${sessionId}`).emit('correct-answer-reveal', {
        questionId: currentQuestion.id,
        correctOptionId
      });

      // Send per-student reveal to all participants
      for (const [studentId, participantSocketId] of Object.entries(state.participants)) {
        const response = await QuizResponse.findOne({
          where: { quizId: sessionId, questionId: currentQuestion.id, studentId }
        });

        io.to(participantSocketId).emit('question-reveal', {
          questionId: currentQuestion.id,
          correctOptionId,
          isCorrect: response ? response.isCorrect : false,
          selectedOptionId: response ? response.selectedOptionId : null
        });
      }

      // ── Leaderboard broadcast (Story 9) ──────────────────────────────────
      // After revealing per-student results, compute the running leaderboard
      // from all QuizResponse rows so far and broadcast to the entire room.
      try {
        const leaderboard = await computeLeaderboard(sessionId);
        io.to(`quiz_${sessionId}`).emit('leaderboard-update', leaderboard);
      } catch (lbError) {
        console.error('Error computing/broadcasting leaderboard:', lbError);
      }
    } catch (error) {
      console.error('Error revealing results:', error);
    }
  };

  io.on('connection', (socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // ==========================================
    // Teacher Events
    // ==========================================
    socket.on('teacher-join', async ({ sessionId, courseId, token }) => {
      // In a real app, we'd verify the token via middleware on the socket.
      // For this story, we trust the teacher-join event since it's initiated 
      // after a successful protected REST API call to /launch.
      
      const quiz = await Quiz.findByPk(sessionId);
      if (!quiz) {
        return socket.emit('error', { message: 'Quiz not found' });
      }

      socket.join(`quiz_${sessionId}`);
      
      // Initialize quiz state if not exists
      if (!quizzes[sessionId]) {
        quizzes[sessionId] = {
          teacherSocketId: socket.id,
          participants: {}, // studentId -> socket.id
          currentQuestionIndex: -1,
          timer: null,
          timeRemaining: 0,
          quizData: quiz,
          questionStartedAt: null,
          questions: await QuizQuestion.findAll({
            where: { quizId: sessionId },
            order: [['order', 'ASC']],
            include: [{ model: QuizOption, as: 'options', attributes: ['id', 'optionText'] }] // exclude isCorrect
          })
        };
      } else {
        // Teacher reconnected
        quizzes[sessionId].teacherSocketId = socket.id;
      }

      console.log(`Teacher joined session ${sessionId}`);
    });

    socket.on('start-question', ({ sessionId, questionIndex }) => {
      const state = quizzes[sessionId];
      if (!state || state.teacherSocketId !== socket.id) return;

      const question = state.questions[questionIndex];
      if (!question) return;

      // Clear any existing timer
      if (state.timer) clearInterval(state.timer);

      state.currentQuestionIndex = questionIndex;
      state.timeRemaining = state.quizData.timeLimitPerQuestion;
      state.questionStartedAt = Date.now(); // Server question-start timestamp

      // Broadcast question without correct answer
      io.to(`quiz_${sessionId}`).emit('question-started', {
        questionIndex,
        question: {
          id: question.id,
          text: question.questionText,
          options: question.options
        },
        timeLimit: state.quizData.timeLimitPerQuestion
      });

      // Start authoritative server timer
      state.timer = setInterval(async () => {
        state.timeRemaining--;
        if (state.timeRemaining <= 0) {
          clearInterval(state.timer);
          state.timer = null;
          io.to(`quiz_${sessionId}`).emit('question-ended', { questionIndex });
          // Broadcast results to room
          await revealResults(sessionId);
        }
      }, 1000);
    });

    socket.on('end-question', async ({ sessionId }) => {
      const state = quizzes[sessionId];
      if (!state || state.teacherSocketId !== socket.id) return;

      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
      state.timeRemaining = 0;
      io.to(`quiz_${sessionId}`).emit('question-ended', { questionIndex: state.currentQuestionIndex });
      // Broadcast results to room
      await revealResults(sessionId);
    });

    socket.on('quiz-ended', async ({ sessionId }) => {
      const state = quizzes[sessionId];
      if (!state || state.teacherSocketId !== socket.id) return;

      if (state.timer) {
        clearInterval(state.timer);
      }

      // Update DB
      try {
        await Quiz.update({ status: 'closed' }, { where: { id: sessionId } });
      } catch (err) {
        console.error('Failed to close quiz in DB', err);
      }

      io.to(`quiz_${sessionId}`).emit('quiz-ended');
      delete quizzes[sessionId];
    });

    // ==========================================
    // Student Events
    // ==========================================
    socket.on('student-subscribe-courses', async ({ studentId }) => {
      try {
        const enrollments = await Enrollment.findAll({
          where: { studentId }
        });
        
        enrollments.forEach(enrollment => {
          socket.join(`course_${enrollment.courseId}`);
        });
        console.log(`Student ${studentId} subscribed to ${enrollments.length} courses.`);
      } catch (err) {
        console.error('Error subscribing to courses:', err);
      }
    });

    socket.on('join-quiz', async ({ sessionId, studentId, courseId }) => {
      try {
        // Validate enrollment
        const isEnrolled = await Enrollment.findOne({
          where: { studentId, courseId }
        });

        if (!isEnrolled) {
          return socket.emit('error', { message: 'You are not enrolled in this course.' });
        }

        const state = quizzes[sessionId];
        if (!state) {
          return socket.emit('error', { message: 'Quiz session has not started yet.' });
        }

        socket.join(`quiz_${sessionId}`);
        state.participants[studentId] = socket.id;
        
        // Let student know where we are
        socket.emit('joined-successfully');
        if (state.currentQuestionIndex >= 0) {
          const q = state.questions[state.currentQuestionIndex];
          
          // If the timer ended, compute reveal data for sync-state
          let revealData = null;
          if (state.timeRemaining <= 0) {
            const correctOption = await QuizOption.findOne({
              where: { questionId: q.id, isCorrect: true }
            });
            const response = await QuizResponse.findOne({
              where: { quizId: sessionId, questionId: q.id, studentId }
            });
            revealData = {
              correctOptionId: correctOption ? correctOption.id : null,
              isCorrect: response ? response.isCorrect : false,
              selectedOptionId: response ? response.selectedOptionId : null
            };
          } else {
            // Also check if they already answered to sync their submission state
            const response = await QuizResponse.findOne({
              where: { quizId: sessionId, questionId: q.id, studentId }
            });
            if (response) {
              revealData = {
                correctOptionId: null, // Keep correct option hidden until time runs out
                isCorrect: null,
                selectedOptionId: response.selectedOptionId
              };
            }
          }

          socket.emit('sync-state', {
            questionIndex: state.currentQuestionIndex,
            timeRemaining: state.timeRemaining,
            question: {
              id: q.id,
              text: q.questionText,
              options: q.options
            },
            reveal: revealData
          });
        }

        // Notify room (for teacher's counter)
        io.to(`quiz_${sessionId}`).emit('participant-update', { count: Object.keys(state.participants).length });
        
        // Track which session this socket belongs to for disconnects
        socket.quizSessionId = sessionId;
        socket.studentId = studentId;

      } catch (error) {
        console.error('Error joining quiz:', error);
        socket.emit('error', { message: 'Failed to join quiz.' });
      }
    });

    // Student submit-answer event
    socket.on('submit-answer', async ({ questionId, optionId }) => {
      const sessionId = socket.quizSessionId;
      const studentId = socket.studentId;

      if (!sessionId || !studentId) {
        return socket.emit('error', { message: 'Session not found. Please join again.' });
      }

      try {
        await submitAnswer({ quizId: sessionId, questionId, studentId, optionId });
        // Emit answer-received acknowledgment back to that specific student's socket
        socket.emit('answer-received', { questionId, optionId });
      } catch (error) {
        console.error('Error in socket submit-answer:', error);
        socket.emit('error', { message: error.message || 'Failed to submit answer.' });
      }
    });

    // ==========================================
    // Disconnect
    // ==========================================
    socket.on('disconnect', () => {
      if (socket.quizSessionId && socket.studentId) {
        const state = quizzes[socket.quizSessionId];
        if (state && state.participants[socket.studentId]) {
          delete state.participants[socket.studentId];
          io.to(`quiz_${socket.quizSessionId}`).emit('participant-update', { count: Object.keys(state.participants).length });
        }
      }
    });
  });
};
