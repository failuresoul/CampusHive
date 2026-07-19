const express = require('express');
const router = express.Router();
const { getAdminStats, getTeacherStats, getStudentStats } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get(
  '/admin',
  authMiddleware,
  roleMiddleware(['admin']),
  getAdminStats
);

router.get(
  '/teacher',
  authMiddleware,
  roleMiddleware(['teacher']),
  getTeacherStats
);

router.get(
  '/student',
  authMiddleware,
  roleMiddleware(['student']),
  getStudentStats
);

module.exports = router;
