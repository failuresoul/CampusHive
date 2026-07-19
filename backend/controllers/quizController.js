const { Quiz, QuizQuestion, QuizOption, CourseTeacher, Course } = require('../models/associations');
const sequelize = require('../config/database');

/**
 * Validates the quiz payload server-side.
 */
const validateQuizPayload = (payload) => {
  if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
    return 'Quiz title is required.';
  }
  
  if (!payload.timeLimit || typeof payload.timeLimit !== 'number' || payload.timeLimit <= 0) {
    return 'Time limit must be a positive number.';
  }

  if (!payload.questions || !Array.isArray(payload.questions) || payload.questions.length === 0) {
    return 'At least one question is required.';
  }

  for (let i = 0; i < payload.questions.length; i++) {
    const q = payload.questions[i];
    if (!q.text || typeof q.text !== 'string' || !q.text.trim()) {
      return `Question ${i + 1} is missing text.`;
    }
    
    if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
      return `Question ${i + 1} must have exactly 4 options.`;
    }

    for (let j = 0; j < q.options.length; j++) {
      if (!q.options[j] || typeof q.options[j] !== 'string' || !q.options[j].trim()) {
        return `Question ${i + 1}, Option ${j + 1} cannot be empty.`;
      }
    }

    if (q.correctAnswerIndex === undefined || q.correctAnswerIndex === null || 
        q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
      return `Question ${i + 1} must have a valid correct answer selected.`;
    }
  }

  return null;
};

exports.createQuiz = async (req, res) => {
  const { courseId } = req.params;
  const teacherId = req.user.id;
  const payload = req.body;

  try {
    // Verify the teacher is assigned to this course
    const courseTeacher = await CourseTeacher.findOne({
      where: { courseId, teacherId }
    });

    if (!courseTeacher) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    // Server-side validation
    const validationError = validateQuizPayload(payload);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Transaction
    const result = await sequelize.transaction(async (t) => {
      // Create the quiz
      const quiz = await Quiz.create({
        courseId,
        teacherId,
        title: payload.title.trim(),
        timeLimitPerQuestion: payload.timeLimit,
        status: 'draft'
      }, { transaction: t });

      // Create questions and options
      for (let i = 0; i < payload.questions.length; i++) {
        const qData = payload.questions[i];
        
        const question = await QuizQuestion.create({
          quizId: quiz.id,
          questionText: qData.text.trim(),
          order: i
        }, { transaction: t });

        const optionsToCreate = qData.options.map((optText, optIdx) => ({
          questionId: question.id,
          optionText: optText.trim(),
          isCorrect: qData.correctAnswerIndex === optIdx
        }));

        await QuizOption.bulkCreate(optionsToCreate, { transaction: t });
      }

      return quiz;
    });

    res.status(201).json({
      success: true,
      data: {
        quizId: result.id,
        status: result.status
      }
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz.', error: error.message });
  }
};

exports.getTeacherQuizzes = async (req, res) => {
  const { courseId } = req.params;
  const teacherId = req.user.id;

  try {
    // Ensure course teacher mapping
    const courseTeacher = await CourseTeacher.findOne({
      where: { courseId, teacherId }
    });

    if (!courseTeacher) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const quizzes = await Quiz.findAll({
      where: { courseId, teacherId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes.' });
  }
};

exports.getQuizDetails = async (req, res) => {
  const { courseId, quizId } = req.params;
  const teacherId = req.user.id;

  try {
    // Verify course teacher mapping
    const courseTeacher = await CourseTeacher.findOne({
      where: { courseId, teacherId }
    });

    if (!courseTeacher) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const quiz = await Quiz.findOne({
      where: { id: quizId, courseId, teacherId },
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id'] // We only need the count for now
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Return title, time limit, and question count
    res.json({
      success: true,
      data: {
        id: quiz.id,
        title: quiz.title,
        timeLimitPerQuestion: quiz.timeLimitPerQuestion,
        status: quiz.status,
        questionCount: quiz.questions ? quiz.questions.length : 0
      }
    });

  } catch (error) {
    console.error('Error fetching quiz details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz details.' });
  }
};

exports.launchQuiz = async (req, res) => {
  const { courseId, quizId } = req.params;
  const teacherId = req.user.id;

  try {
    const courseTeacher = await CourseTeacher.findOne({
      where: { courseId, teacherId }
    });

    if (!courseTeacher) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this course.' });
    }

    const quiz = await Quiz.findOne({
      where: { id: quizId, courseId, teacherId }
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    if (quiz.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This quiz is already closed.' });
    }

    quiz.status = 'launched';
    await quiz.save();

    // Fetch course for notification details
    const course = await Course.findByPk(courseId);
    if (course) {
      const io = req.app.get('io');
      if (io) {
        io.to(`course_${courseId}`).emit('quiz-live', {
          courseId,
          quizId,
          courseName: course.name,
          quizTitle: quiz.title
        });
      }
    }

    // Use quizId as the reliable session identifier
    res.json({ success: true, data: { sessionId: quiz.id } });

  } catch (error) {
    console.error('Error launching quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to launch quiz.' });
  }
};

const { submitAnswer } = require('../services/quizSessionService');

exports.submitAnswerREST = async (req, res) => {
  const { quizId, questionId } = req.params;
  const { optionId } = req.body;
  const studentId = req.user.id;

  try {
    const response = await submitAnswer({ quizId, questionId, studentId, optionId });
    res.status(200).json({
      success: true,
      message: 'Answer recorded successfully.',
      data: {
        id: response.id,
        quizId: response.quizId,
        questionId: response.questionId,
        selectedOptionId: response.selectedOptionId,
        answeredAt: response.answeredAt,
        responseTimeMs: response.responseTimeMs
      }
    });
  } catch (error) {
    console.error('Error in submitAnswerREST:', error);
    if (error.status && error.message) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to record answer.' });
  }
};

// ── Leaderboard REST fallback (Story 9) ──────────────────────────────────
// GET /api/quizzes/:quizId/leaderboard
// Returns the current ranked leaderboard for a quiz, computed on-the-fly
// from persisted QuizResponse scores. Useful as a resync source when a
// client reconnects mid-quiz and needs the current state immediately
// rather than waiting for the next socket broadcast.
const { computeLeaderboard } = require('../services/leaderboardService');

exports.getLeaderboard = async (req, res) => {
  const { quizId } = req.params;

  try {
    const leaderboard = await computeLeaderboard(quizId);
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard.' });
  }
};
