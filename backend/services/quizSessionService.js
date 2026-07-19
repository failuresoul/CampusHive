const { Quiz, QuizQuestion, QuizOption, Enrollment, QuizResponse } = require('../models/associations');

// In-memory state shared across socket and REST API
// quizzes[sessionId] = { teacherSocketId, questionIndex, timer, ... }
const quizzes = {};

/**
 * Validates and records a student's answer submission.
 * Shares identical logic between WebSocket and REST handlers.
 */
const submitAnswer = async ({ quizId, questionId, studentId, optionId }) => {
  const state = quizzes[quizId];
  if (!state) {
    throw { status: 400, message: 'Quiz session has not started yet.' };
  }

  // 1. Validate that the question index is valid and matches the requested questionId
  if (state.currentQuestionIndex < 0) {
    throw { status: 400, message: 'No question is currently active.' };
  }
  const currentQuestion = state.questions[state.currentQuestionIndex];
  if (!currentQuestion || currentQuestion.id !== questionId) {
    throw { status: 400, message: 'This question is not currently active.' };
  }

  // 2. Reject late submissions (countdown has ended)
  if (state.timeRemaining <= 0 || !state.timer) {
    throw { status: 400, message: 'Time has expired for this question.' };
  }

  // 3. Verify student is enrolled in the course
  const enrollment = await Enrollment.findOne({
    where: { studentId, courseId: state.quizData.courseId }
  });
  if (!enrollment) {
    throw { status: 403, message: 'You are not enrolled in this course.' };
  }

  // 4. Verify student hasn't already answered this question (no double submissions)
  const existingResponse = await QuizResponse.findOne({
    where: { quizId, questionId, studentId }
  });
  if (existingResponse) {
    throw { status: 400, message: 'You have already submitted an answer for this question.' };
  }

  // 5. Verify the option exists and is valid for this question, then compute correctness
  const option = await QuizOption.findOne({
    where: { id: optionId, questionId }
  });
  if (!option) {
    throw { status: 400, message: 'Invalid option selected.' };
  }

  // 6. Record responseTimeMs based on server's own question-start timestamp
  const responseTimeMs = state.questionStartedAt ? (Date.now() - state.questionStartedAt) : 0;

  // 7. Write to the database
  const response = await QuizResponse.create({
    quizId,
    questionId,
    studentId,
    selectedOptionId: optionId,
    isCorrect: option.isCorrect,
    answeredAt: new Date(),
    responseTimeMs
  });

  return response;
};

module.exports = {
  quizzes,
  submitAnswer
};
