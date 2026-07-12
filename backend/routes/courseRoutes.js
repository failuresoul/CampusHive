const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/courses
// List all courses (authenticated users)
router.get(
  '/',
  authMiddleware,
  courseController.getCourses
);

// POST /api/courses
// Create a new course (admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.createCourse
);

// GET /api/courses/:courseId/teachers
// List teachers assigned to a course (authenticated users)
router.get(
  '/:courseId/teachers',
  authMiddleware,
  courseController.getCourseTeachers
);

// POST /api/courses/:courseId/teachers
// Assign a teacher to a course (admin only)
router.post(
  '/:courseId/teachers',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.assignTeacher
);

// DELETE /api/courses/:courseId/teachers/:teacherId
// Remove a teacher assignment (admin only)
router.delete(
  '/:courseId/teachers/:teacherId',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.removeTeacherAssignment
);

// GET /api/courses/:courseId/eligible-students
// Get eligible students for a course (admin only)
router.get(
  '/:courseId/eligible-students',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.getEligibleStudents
);

// POST /api/courses/:courseId/auto-enroll
// Auto enroll eligible students for a course (admin only)
router.post(
  '/:courseId/auto-enroll',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.autoEnroll
);

module.exports = router;
