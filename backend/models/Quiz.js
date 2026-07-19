const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timeLimitPerQuestion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 30,
  },
  status: {
    type: DataTypes.ENUM('draft', 'launched', 'closed'),
    defaultValue: 'draft',
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = Quiz;
