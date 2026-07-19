const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizResponse = sequelize.define('QuizResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  selectedOptionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  answeredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  responseTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Per-question score computed at submission time by leaderboardService.computeScore().
  // Persisted here so leaderboard queries can simply SUM(score) per student.
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

module.exports = QuizResponse;
