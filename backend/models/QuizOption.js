const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizOption = sequelize.define('QuizOption', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  optionText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
});

module.exports = QuizOption;
