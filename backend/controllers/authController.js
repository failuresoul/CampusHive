const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Return generic error message
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT payload
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Sign JWT
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
      { expiresIn: '24h' }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * GET /api/auth/me
 * Returns the profile of the currently authenticated user.
 * Requires: authMiddleware (any role)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/auth/admin/users
 * Returns a list of all users in the system.
 * Requires: authMiddleware + roleMiddleware(['admin'])
 */
const listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'ASC']],
    });

    return res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    console.error('listUsers error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  login,
  getMe,
  listUsers,
};
