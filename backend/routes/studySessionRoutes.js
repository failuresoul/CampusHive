const express = require('express');
const router = express.Router();
const { 
  createStudySession, 
  getStudySessions, 
  getStudySessionById, 
  rsvpToSession, 
  cancelRsvp 
} = require('../controllers/studySessionController');
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
 * GET /api/study-sessions/:id
 * Retrieves details of a specific study session.
 * Protected: Authenticated users.
 */
router.get(
  '/:id',
  authMiddleware,
  getStudySessionById
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

/**
 * POST /api/study-sessions/:id/rsvp
 * RSVP to a study session.
 * Protected: Student only.
 */
router.post(
  '/:id/rsvp',
  authMiddleware,
  roleMiddleware(['student']),
  rsvpToSession
);

/**
 * DELETE /api/study-sessions/:id/rsvp
 * Cancel RSVP to a study session.
 * Protected: Student only.
 */
router.delete(
  '/:id/rsvp',
  authMiddleware,
  roleMiddleware(['student']),
  cancelRsvp
);

module.exports = router;
