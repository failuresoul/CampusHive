const express = require('express');
const router = express.Router();
const { createStudySession, getStudySessions } = require('../controllers/studySessionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/study-sessions
 * Retrieves all study sessions (filterable & paginated).
 * Protected: Authenticated users.
 */
router.get(
  '/',
  authMiddleware,
  getStudySessions
);

/**
 * POST /api/study-sessions
 * Creates a new study session post.
 * Protected: Student only.
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['student']),
  createStudySession
);

module.exports = router;
