const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/students/preview-roll-number
// Preview roll number for a given department and batch
router.post(
  '/preview-roll-number',
  authMiddleware,
  roleMiddleware(['admin']),
  studentController.previewRollNumber
);

module.exports = router;
