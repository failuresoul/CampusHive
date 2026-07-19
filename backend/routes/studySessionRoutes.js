const express = require('express');
const router = express.Router();
const { createStudySession } = require('../controllers/studySessionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

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
