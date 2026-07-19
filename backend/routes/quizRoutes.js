const express = require('express');
const router = express.Router({ mergeParams: true });
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/courses/:courseId/quizzes
// Create a new quiz for a course (teacher only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['teacher']),
  quizController.createQuiz
);

// GET /api/courses/:courseId/quizzes
// Get all quizzes for a course taught by the logged-in teacher
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['teacher']),
  quizController.getTeacherQuizzes
);

// GET /api/courses/:courseId/quizzes/:quizId
// Get details of a specific quiz for launch UI
router.get(
  '/:quizId',
  authMiddleware,
  roleMiddleware(['teacher']),
  quizController.getQuizDetails
);

// POST /api/courses/:courseId/quizzes/:quizId/launch
// Launch a quiz (teacher only)
router.post(
  '/:quizId/launch',
  authMiddleware,
  roleMiddleware(['teacher']),
  quizController.launchQuiz
);

module.exports = router;
