const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/materials/:materialId/download
 * Securely downloads course materials for students or teachers.
 */
router.get('/:materialId/download', authMiddleware, courseController.downloadMaterial);

module.exports = router;
