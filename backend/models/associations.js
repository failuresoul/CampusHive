const Course = require('./Course');
const User = require('./User');
const CourseTeacher = require('./CourseTeacher');
const Enrollment = require('./Enrollment');
const LabReport = require('./LabReport');
const Notification = require('./Notification');

// Course - User (Teacher) Many-to-Many Relationship
Course.belongsToMany(User, {
  through: CourseTeacher,
  as: 'teachers',
  foreignKey: 'courseId',
  otherKey: 'teacherId',
});

User.belongsToMany(Course, {
  through: CourseTeacher,
  as: 'courses',
  foreignKey: 'teacherId',
  otherKey: 'courseId',
});

// Course - User (Student) Many-to-Many Relationship
Course.belongsToMany(User, {
  through: Enrollment,
  as: 'students',
  foreignKey: 'courseId',
  otherKey: 'studentId',
});

User.belongsToMany(Course, {
  through: Enrollment,
  as: 'enrolledCourses',
  foreignKey: 'studentId',
  otherKey: 'courseId',
});

// LabReport Relationships
LabReport.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
User.hasMany(LabReport, { as: 'labReports', foreignKey: 'studentId' });

LabReport.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(LabReport, { as: 'labReports', foreignKey: 'courseId' });

// Notification Relationships
// userId is a UUID string (User.id), so we keep it as a plain STRING column
// and manage the logical FK at the application level (no Sequelize FK constraint)
// to avoid SQLite limitations on adding FK constraints to existing tables.
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'userId' });
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });

module.exports = {
  Course,
  User,
  CourseTeacher,
  Enrollment,
  LabReport,
  Notification,
};

