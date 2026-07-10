const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

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

module.exports = router;

