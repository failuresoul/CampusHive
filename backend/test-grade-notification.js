/**
 * test-grade-notification.js  — Story 8 manual verification script
 *
 * Usage (from the /backend directory):
 *   node test-grade-notification.js <labReportId>
 *
 * What it does:
 *   1. Calls notifyStudentOfGrade(labReportId) to create a Notification row
 *   2. Prints the created notification to confirm correct student + message
 *
 * Pre-requisites:
 *   - Backend dependencies installed (npm install)
 *   - At least one LabReport row exists in the DB (run node seed.js if needed)
 */

require('dotenv').config();
const sequelize = require('./config/database');
require('./models/associations'); // ensures all models & Notification table are synced
const notifyStudentOfGrade = require('./utils/notifyStudentOfGrade');

const labReportId = parseInt(process.argv[2], 10);

if (!labReportId || isNaN(labReportId)) {
  console.error('Usage: node test-grade-notification.js <labReportId>');
  process.exit(1);
}

(async () => {
  try {
    // Sync DB so the Notifications table exists
    await sequelize.sync();
    console.log('✔  Database synced');

    const notification = await notifyStudentOfGrade(labReportId);
    console.log('\n✔  Notification created successfully:');
    console.log(JSON.stringify(notification.toJSON(), null, 2));
  } catch (err) {
    console.error('\n✘  Error:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
