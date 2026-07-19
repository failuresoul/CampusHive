const { QuizResponse, User } = require('../models/associations');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// ════════════════════════════════════════════════════════════════════════════
// SCORING RULE  (Story 9 — Leaderboard Calculation API)
// ════════════════════════════════════════════════════════════════════════════
//
// Each question is scored independently:
//
//   • Correct answer:
//       BASE_POINTS                                          = 100
//     + speed bonus  = floor(100 × remainingTimeMs / totalTimeMs)
//     ─────────────────────────────────────────────────────────────
//       Capped at MAX_SCORE_PER_QUESTION                    = 200
//
//   • Incorrect answer or unanswered: 0
//
// Where:
//   totalTimeMs     = timeLimitSeconds × 1000
//   remainingTimeMs = max(0, totalTimeMs − responseTimeMs)
//
// This rewards both correctness (base) and speed (bonus).
// A student who answers correctly at t=0 gets 200; at exactly the deadline
// they get 100; an incorrect answer always gets 0.
// ════════════════════════════════════════════════════════════════════════════

const BASE_POINTS = 100;
const SPEED_BONUS_MAX = 100;
const MAX_SCORE_PER_QUESTION = 200;

/**
 * Computes the score for a single question response.
 *
 * @param {boolean} isCorrect       Whether the student answered correctly.
 * @param {number}  responseTimeMs  Time taken to respond in milliseconds.
 * @param {number}  timeLimitSeconds  The per-question time limit in seconds.
 * @returns {number} Score for this question (0 – MAX_SCORE_PER_QUESTION).
 */
const computeScore = (isCorrect, responseTimeMs, timeLimitSeconds) => {
  if (!isCorrect) return 0;

  const totalTimeMs = timeLimitSeconds * 1000;
  const remainingTimeMs = Math.max(0, totalTimeMs - responseTimeMs);
  const speedBonus = Math.floor(SPEED_BONUS_MAX * (remainingTimeMs / totalTimeMs));

  return Math.min(BASE_POINTS + speedBonus, MAX_SCORE_PER_QUESTION);
};

// ════════════════════════════════════════════════════════════════════════════
// LEADERBOARD COMPUTATION
// ════════════════════════════════════════════════════════════════════════════
//
// Aggregates all QuizResponse rows for a quiz session:
//   1. SUM(score) per student           → totalScore
//   2. SUM(responseTimeMs) per student  → totalResponseTime (tiebreaker)
//   3. ORDER BY totalScore DESC, totalResponseTime ASC
//      (higher score wins; on ties, faster cumulative response wins)
//   4. Assign sequential rank (1-indexed)
//
// Returns: [{ studentId, name, score, rank }]
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computes the full ranked leaderboard for a quiz.
 *
 * @param {string} quizId  UUID of the quiz session.
 * @returns {Promise<Array<{studentId: string, name: string, score: number, rank: number}>>}
 */
const computeLeaderboard = async (quizId) => {
  // Raw query for efficient aggregation with JOIN to User for names.
  // Works on both SQLite and MySQL.
  const rows = await sequelize.query(
    `SELECT
       qr."studentId",
       u."name",
       COALESCE(SUM(qr."score"), 0)          AS "totalScore",
       COALESCE(SUM(qr."responseTimeMs"), 0)  AS "totalResponseTime"
     FROM "QuizResponses" qr
     INNER JOIN "Users" u ON u."id" = qr."studentId"
     WHERE qr."quizId" = :quizId
     GROUP BY qr."studentId", u."name"
     ORDER BY "totalScore" DESC, "totalResponseTime" ASC`,
    {
      replacements: { quizId },
      type: QueryTypes.SELECT,
    }
  );

  // Assign 1-based ranks
  return rows.map((row, index) => ({
    studentId: row.studentId,
    name: row.name,
    score: Number(row.totalScore),
    rank: index + 1,
  }));
};

module.exports = {
  computeScore,
  computeLeaderboard,
  BASE_POINTS,
  SPEED_BONUS_MAX,
  MAX_SCORE_PER_QUESTION,
};
