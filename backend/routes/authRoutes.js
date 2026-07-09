const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post('/login', authController.login);

// ─── Protected Routes (any authenticated user) ────────────────────────────────
// NOTE FOR FUTURE EPICS: All new protected endpoints must use authMiddleware.
// Add roleMiddleware(['role']) after authMiddleware for role-restricted endpoints.

// GET /api/auth/me — returns the currently logged-in user's profile
router.get('/me', authMiddleware, authController.getMe);

// ─── Admin-only Routes ────────────────────────────────────────────────────────

// GET /api/auth/admin/users — example admin-only endpoint
router.get(
  '/admin/users',
  authMiddleware,
  roleMiddleware(['admin']),
  authController.listUsers
);

module.exports = router;
