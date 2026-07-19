const { Quiz, QuizQuestion, QuizOption, Enrollment } = require('../models/associations');

module.exports = (io) => {
  // In-memory state
  // quizzes[sessionId] = { teacherSocketId, questionIndex, timer, ... }
  const quizzes = {};

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
          participants: new Set(),
          currentQuestionIndex: -1,
          timer: null,
          timeRemaining: 0,
          quizData: quiz,
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
      state.timer = setInterval(() => {
        state.timeRemaining--;
        if (state.timeRemaining <= 0) {
          clearInterval(state.timer);
          state.timer = null;
          io.to(`quiz_${sessionId}`).emit('question-ended', { questionIndex });
        }
      }, 1000);
    });

    socket.on('end-question', ({ sessionId }) => {
      const state = quizzes[sessionId];
      if (!state || state.teacherSocketId !== socket.id) return;

      if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
      }
      state.timeRemaining = 0;
      io.to(`quiz_${sessionId}`).emit('question-ended', { questionIndex: state.currentQuestionIndex });
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
        state.participants.add(studentId);
        
        // Let student know where we are
        socket.emit('joined-successfully');
        if (state.currentQuestionIndex >= 0) {
          const q = state.questions[state.currentQuestionIndex];
          socket.emit('sync-state', {
            questionIndex: state.currentQuestionIndex,
            timeRemaining: state.timeRemaining,
            question: {
              id: q.id,
              text: q.questionText,
              options: q.options
            }
          });
        }

        // Notify room (for teacher's counter)
        io.to(`quiz_${sessionId}`).emit('participant-update', { count: state.participants.size });
        
        // Track which session this socket belongs to for disconnects
        socket.quizSessionId = sessionId;
        socket.studentId = studentId;

      } catch (error) {
        console.error('Error joining quiz:', error);
        socket.emit('error', { message: 'Failed to join quiz.' });
      }
    });

    // ==========================================
    // Disconnect
    // ==========================================
    socket.on('disconnect', () => {
      if (socket.quizSessionId && socket.studentId) {
        const state = quizzes[socket.quizSessionId];
        if (state) {
          // Note: In a robust app, we might wait before removing to handle brief network blips, 
          // but for this story, decrementing immediately is fine.
          state.participants.delete(socket.studentId);
          io.to(`quiz_${socket.quizSessionId}`).emit('participant-update', { count: state.participants.size });
        }
      }
    });
  });
};
