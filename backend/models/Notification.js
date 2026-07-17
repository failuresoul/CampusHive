const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Notification model — Story 8 (Grade Notification API)
 *
 * Fields:
 *   id          – Auto-increment PK
 *   userId      – The recipient (student) User.id (UUID FK)
 *   type        – ENUM; currently only 'grade_posted', extensible for future types
 *   referenceId – The LabReport id this notification is about (INTEGER FK)
 *   message     – Human-readable notification text
 *   isRead      – Whether the student has read/dismissed the notification
 *   createdAt   – Managed by Sequelize timestamps
 */
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    // References User.id (UUID string)
    type: DataTypes.STRING(36),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('grade_posted'),
    allowNull: false,
    defaultValue: 'grade_posted',
  },
  referenceId: {
    // The LabReport.id this notification refers to
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'Notifications',
  timestamps: true,          // provides createdAt, updatedAt
  updatedAt: false,          // we only need createdAt
});

module.exports = Notification;
