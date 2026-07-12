const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * CourseTeacher Join Model
 * Maps many-to-many relationship between Courses and Users (role = teacher).
 */
const CourseTeacher = sequelize.define('CourseTeacher', {
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
  teacherId: {
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
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'CourseTeachers',
  timestamps: false,
});

module.exports = CourseTeacher;
