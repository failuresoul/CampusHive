/**
 * migrate-teacher-fields.js
 *
 * One-shot migration — adds the two new teacher-specific columns to the
 * Users table introduced in Story 8.
 *
 * Safe to re-run: each addColumn is wrapped in a try/catch so a second
 * execution won't fail if the column already exists.
 *
 * Usage:
 *   node migrate-teacher-fields.js
 *   # or via npm script:
 *   npm run migrate-teacher
 */

require('dotenv').config();
const sequelize = require('./config/database');
const { DataTypes } = require('sequelize');

async function migrateTeacherFields() {
  const qi = sequelize.getQueryInterface();

  console.log('Running Story 8 migration: adding teacher fields to Users table…');

  // ── designation ────────────────────────────────────────────────────────────
  try {
    await qi.addColumn('Users', 'designation', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    });
    console.log('  ✓ Added column: designation');
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('duplicate column')) {
      console.log('  ⚠ Column already exists (skipped): designation');
    } else {
      throw err;
    }
  }

  // ── mustChangePassword ─────────────────────────────────────────────────────
  try {
    await qi.addColumn('Users', 'mustChangePassword', {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    });
    console.log('  ✓ Added column: mustChangePassword');
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('duplicate column')) {
      console.log('  ⚠ Column already exists (skipped): mustChangePassword');
    } else {
      throw err;
    }
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrateTeacherFields().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
