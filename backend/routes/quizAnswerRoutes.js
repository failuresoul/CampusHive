const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/quizzes/:quizId/questions/:questionId/answer
router.post(
  '/:quizId/questions/:questionId/answer',
  authMiddleware,
  roleMiddleware(['student']),
  quizController.submitAnswerREST
);

// GET /api/quizzes/:quizId/leaderboard
// Resync fallback — accessible by both teachers and students (no role restriction)
router.get(
  '/:quizId/leaderboard',
  authMiddleware,
  quizController.getLeaderboard
);

module.exports = router;
