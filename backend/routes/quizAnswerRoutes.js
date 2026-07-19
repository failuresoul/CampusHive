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

module.exports = router;
