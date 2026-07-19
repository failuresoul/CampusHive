/**
 * Migration: Add `score` column to QuizResponses table.
 *
 * Story 9 — Leaderboard Calculation API
 *
 * Run once:  node migrate-quiz-response-score.js
 *
 * This adds the `score` INTEGER column (default 0) to the existing
 * QuizResponses table. Idempotent — skips if the column already exists.
 */
const sequelize = require('./config/database');
const queryInterface = sequelize.getQueryInterface();
const { DataTypes } = require('sequelize');

(async () => {
  try {
    // Load associations so all models are registered
    require('./models/associations');

    const tableDescription = await queryInterface.describeTable('QuizResponses');

    if (tableDescription.score) {
      console.log('✔ Column `score` already exists on QuizResponses. Nothing to do.');
    } else {
      await queryInterface.addColumn('QuizResponses', 'score', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      console.log('✔ Added `score` column to QuizResponses table.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
