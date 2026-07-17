const express = require('express');
const router = express.Router();
const { gradeSubmission, getSubmissionById } = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/lab-reports/:submissionId
 * Fetches a single submission. Protected: teacher only.
 */
router.get(
  '/:submissionId',
  authMiddleware,
  roleMiddleware(['teacher']),
  getSubmissionById
);

/**
 * POST /api/lab-reports/:submissionId/grade
 * Grades a submission. Protected: teacher only.
 */
router.post(
  '/:submissionId/grade',
  authMiddleware,
  roleMiddleware(['teacher']),
  gradeSubmission
);

module.exports = router;
