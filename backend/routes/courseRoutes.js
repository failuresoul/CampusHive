const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/courses
// Create a new course (admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.createCourse
);

module.exports = router;
