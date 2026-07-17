const { LabReport, Course, User } = require('../models/associations');
const Notification = require('../models/Notification');

/**
 * notifyStudentOfGrade(labReportId)
 *
 * Story 8 utility — creates a Notification row for the student whose lab
 * report was just graded.  This function is intentionally standalone so it
 * can be called from the Save Grade API (Story 11) without coupling to the
 * HTTP layer.
 *
 * @param {number} labReportId  – The LabReport.id that was graded
 * @returns {Promise<Notification>} The newly created Notification instance
 * @throws Will throw if the LabReport (or its associations) is not found,
 *         or if the database write fails.
 */
async function notifyStudentOfGrade(labReportId) {
  // 1. Look up the lab report together with its course (for courseCode)
  const labReport = await LabReport.findByPk(labReportId, {
    include: [
      {
        model: Course,
        as: 'course',
        attributes: ['id', 'code', 'title'],
      },
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name'],
      },
    ],
  });

  if (!labReport) {
    throw new Error(`LabReport with id ${labReportId} not found`);
  }

  if (!labReport.student) {
    throw new Error(`LabReport ${labReportId} has no associated student`);
  }

  if (!labReport.course) {
    throw new Error(`LabReport ${labReportId} has no associated course`);
  }

  const courseCode = labReport.course.code; // e.g. "CSE-3106"

  // 2. Build the notification message
  const message = `Your submission for ${courseCode} has been graded`;

  // 3. Persist the notification
  const notification = await Notification.create({
    userId: labReport.studentId,
    type: 'grade_posted',
    referenceId: labReport.id,
    message,
  });

  return notification;
}

module.exports = notifyStudentOfGrade;
