const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/students/me/courses
// Get enrolled courses for the logged-in student
router.get(
  '/me/courses',
  authMiddleware,
  roleMiddleware(['student']),
  studentController.getMyCourses
);

// GET /api/students
// Paginated, filterable, sortable student list (admin only)
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  studentController.getStudents
);

// POST /api/students/preview-roll-number
// Preview roll number for a given department and batch
router.post(
  '/preview-roll-number',
  authMiddleware,
  roleMiddleware(['admin']),
  studentController.previewRollNumber
);

// POST /api/students/bulk-import
// Bulk import students from a CSV payload
router.post(
  '/bulk-import',
  authMiddleware,
  roleMiddleware(['admin']),
  studentController.bulkImport
);

// ── Notification Routes (Story 8) ─────────────────────────────────────────────

// GET /api/students/me/notifications
// Returns the logged-in student's notifications, newest first
router.get(
  '/me/notifications',
  authMiddleware,
  roleMiddleware(['student']),
  notificationController.getMyNotifications
);

// PATCH /api/students/me/notifications/:id/read
// Marks a single notification as read (403 if it belongs to another student)
router.patch(
  '/me/notifications/:id/read',
  authMiddleware,
  roleMiddleware(['student']),
  notificationController.markNotificationRead
);

module.exports = router;

