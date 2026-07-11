const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Course model
 * Defines the fields for academic courses.
 */
const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creditHours: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  batchSemester: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = Course;
