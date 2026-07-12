const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Enrollment Join Model
 * Maps many-to-many relationship between Courses and Users (role = student).
 */
const Enrollment = sequelize.define('Enrollment', {
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Courses',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  enrolledAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Enrollments',
  timestamps: false,
});

module.exports = Enrollment;
