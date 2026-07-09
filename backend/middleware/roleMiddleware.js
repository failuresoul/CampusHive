/**
 * roleMiddleware
 * Higher-order middleware factory. Call with an array of allowed roles.
 * Must be used AFTER authMiddleware (depends on req.user being set).
 *
 * Usage:
 *   router.get('/admin-only', authMiddleware, roleMiddleware(['admin']), handler);
 *   router.get('/staff', authMiddleware, roleMiddleware(['admin', 'teacher']), handler);
 *
 * On success: calls next()
 * On failure: returns 403 Forbidden
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      // authMiddleware should have caught this, but guard anyway
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user context',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: '${req.user.role}' role does not have access to this resource`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
