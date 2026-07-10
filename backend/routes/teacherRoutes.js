const express = require('express');
const router = express.Router();
const { registerTeacher, getTeachers } = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/teachers
 *
 * Paginated, searchable, filterable teacher list (admin only).
 * Query params: search, department, page, pageSize
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  getTeachers
);

/**
 * POST /api/teachers
 *
 * Registers a new teacher account.
 * Protected: must be authenticated AND have the 'admin' role.
 *
 * 401 – no / invalid / expired token (authMiddleware)
 * 403 – authenticated but not admin (roleMiddleware)
 * 400 – validation errors
 * 409 – duplicate email
 * 201 – created successfully
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  registerTeacher
);

module.exports = router;
