/**
 * migrate-student-fields.js
 *
 * One-time migration: adds the student profile columns to the existing Users
 * table in the SQLite database.
 *
 * Safe to run multiple times — each ADD COLUMN is wrapped in a try/catch
 * and silently skipped if the column already exists.
 *
 * Usage:
 *   node migrate-student-fields.js
 */

require('dotenv').config();
const sequelize = require('./config/database');

const COLUMNS = [
  { name: 'rollNumber', definition: 'VARCHAR(255)' },
  { name: 'department', definition: 'VARCHAR(255)' },
  { name: 'batch',      definition: 'VARCHAR(255)' },
  { name: 'phone',      definition: 'VARCHAR(255)' },
  { name: 'status',     definition: "VARCHAR(20) DEFAULT 'active'" },
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    for (const col of COLUMNS) {
      try {
        await sequelize.query(
          `ALTER TABLE "Users" ADD COLUMN "${col.name}" ${col.definition};`
        );
        console.log(`✓ Added column: ${col.name}`);
      } catch (err) {
        // SQLite throws if the column already exists — that's fine, skip it
        if (
          err.message &&
          (err.message.includes('duplicate column') ||
            err.message.includes('already exists'))
        ) {
          console.log(`→ Column already exists, skipping: ${col.name}`);
        } else {
          throw err; // unexpected error — bubble up
        }
      }
    }

    console.log('\nMigration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
