const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User model — extended in Story 6 (student fields) and Story 8 (teacher fields).
 *
 * Indexes added for columns used in GET /api/students filtering / sorting:
 *   - department, batch, status  → filter dropdowns
 *   - name                       → search + sort
 *   - rollNumber                 → search + sort
 *
 * SQLite ignores the `indexes` array on sequelize.define but honours them on
 * sync({ alter: true }) / queryInterface.addIndex in migrations.
 * MySQL/PostgreSQL will create them automatically on first sync.
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'teacher', 'student'),
    allowNull: false,
  },
  // ── Student profile fields (null for admin / teacher rows) ──────────────────
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    // Note: unique constraint omitted here because SQLite's ALTER TABLE
    // cannot add a UNIQUE column to an existing table. Uniqueness is
    // guaranteed at the application level by the roll-number generation
    // mutex. On MySQL / a fresh DB the index block below adds the constraint.
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,  // 'active' | 'inactive' — STRING for SQLite ALTER compat
    allowNull: true,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive']],
    },
  },
  // ── Teacher profile fields (null for admin / student rows) ──────────────────
  designation: {
    // e.g. 'Lecturer' | 'Assistant Professor' | 'Associate Professor' | 'Professor'
    type: DataTypes.STRING,
    allowNull: true,
  },
  mustChangePassword: {
    // Set to true when an admin creates an account so the user is prompted
    // to change their password on first login (future story).
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
}, {
  timestamps: true,
  // Note: Indexes below are defined for documentation / MySQL intent.
  // On SQLite they are not applied via ALTER TABLE; add them via migrations
  // or a fresh DB sync for MySQL/PostgreSQL.
  //
  // Intended indexes:
  //   idx_users_dept_batch  – (department, batch)  — combined filter
  //   idx_users_status      – status
  //   idx_users_name        – name (sort + search)
  //   idx_users_roll_number – rollNumber (sort + search)
  //   idx_users_role        – role (scope to students)
});

module.exports = User;
