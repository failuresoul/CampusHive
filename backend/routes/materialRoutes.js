const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/materials/:materialId/download
 * Securely downloads course materials for students or teachers.
 */
router.get('/:materialId/download', authMiddleware, courseController.downloadMaterial);

/**
 * POST /api/materials/:materialId/bookmark
 * Create a material bookmark (idempotent, student only).
 */
router.post(
  '/:materialId/bookmark',
  authMiddleware,
  roleMiddleware(['student']),
  courseController.bookmarkMaterial
);

/**
 * DELETE /api/materials/:materialId/bookmark
 * Remove a material bookmark (idempotent, student only).
 */
router.delete(
  '/:materialId/bookmark',
  authMiddleware,
  roleMiddleware(['student']),
  courseController.unbookmarkMaterial
);

module.exports = router;
