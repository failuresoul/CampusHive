const jwt = require('jsonwebtoken');

/**
 * authMiddleware
 * Reads the JWT from the Authorization header (Bearer token).
 * On success: attaches the decoded payload to req.user and calls next().
 * On failure: returns 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production'
    );
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token',
    });
  }
};

module.exports = authMiddleware;
