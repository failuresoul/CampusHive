const Course = require('./Course');
const User = require('./User');
const CourseTeacher = require('./CourseTeacher');
const Enrollment = require('./Enrollment');
const LabReport = require('./LabReport');
const Notification = require('./Notification');
const Quiz = require('./Quiz');
const QuizQuestion = require('./QuizQuestion');
const QuizOption = require('./QuizOption');
const QuizResponse = require('./QuizResponse');
const StudySession = require('./StudySession');
const LostFoundItem = require('./LostFoundItem');
const StudySessionRsvp = require('./StudySessionRsvp');
const LostFoundClaim = require('./LostFoundClaim');

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

// Quiz Relationships
Quiz.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(Quiz, { as: 'quizzes', foreignKey: 'courseId' });

Quiz.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });
User.hasMany(Quiz, { as: 'createdQuizzes', foreignKey: 'teacherId' });

Quiz.hasMany(QuizQuestion, { as: 'questions', foreignKey: 'quizId' });
QuizQuestion.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });

QuizQuestion.hasMany(QuizOption, { as: 'options', foreignKey: 'questionId' });
QuizOption.belongsTo(QuizQuestion, { as: 'question', foreignKey: 'questionId' });

// QuizResponse Relationships
QuizResponse.belongsTo(Quiz, { as: 'quiz', foreignKey: 'quizId' });
Quiz.hasMany(QuizResponse, { as: 'responses', foreignKey: 'quizId' });

QuizResponse.belongsTo(QuizQuestion, { as: 'question', foreignKey: 'questionId' });
QuizQuestion.hasMany(QuizResponse, { as: 'responses', foreignKey: 'questionId' });

QuizResponse.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
User.hasMany(QuizResponse, { as: 'quizResponses', foreignKey: 'studentId' });

QuizResponse.belongsTo(QuizOption, { as: 'selectedOption', foreignKey: 'selectedOptionId' });
QuizOption.hasMany(QuizResponse, { as: 'responses', foreignKey: 'selectedOptionId' });

// StudySession Relationships
StudySession.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
User.hasMany(StudySession, { as: 'createdSessions', foreignKey: 'creatorId' });

StudySession.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
Course.hasMany(StudySession, { as: 'studySessions', foreignKey: 'courseId' });

// LostFoundItem Relationships
LostFoundItem.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });
User.hasMany(LostFoundItem, { as: 'lostFoundItems', foreignKey: 'reporterId' });

// StudySessionRsvp Relationships
StudySessionRsvp.belongsTo(StudySession, { as: 'session', foreignKey: 'sessionId' });
StudySession.hasMany(StudySessionRsvp, { as: 'rsvps', foreignKey: 'sessionId' });

StudySessionRsvp.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
User.hasMany(StudySessionRsvp, { as: 'rsvps', foreignKey: 'studentId' });

// Many-to-Many via StudySessionRsvp (for participants list querying)
StudySession.belongsToMany(User, { through: StudySessionRsvp, as: 'participants', foreignKey: 'sessionId', otherKey: 'studentId' });
User.belongsToMany(StudySession, { through: StudySessionRsvp, as: 'rsvpSessions', foreignKey: 'studentId', otherKey: 'sessionId' });

// LostFoundClaim Relationships
LostFoundClaim.belongsTo(LostFoundItem, { as: 'item', foreignKey: 'itemId' });
LostFoundItem.hasMany(LostFoundClaim, { as: 'claims', foreignKey: 'itemId' });

LostFoundClaim.belongsTo(User, { as: 'claimant', foreignKey: 'claimantId' });
User.hasMany(LostFoundClaim, { as: 'claims', foreignKey: 'claimantId' });

module.exports = {
  Course,
  User,
  CourseTeacher,
  Enrollment,
  LabReport,
  Notification,
  Quiz,
  QuizQuestion,
  QuizOption,
  QuizResponse,
  StudySession,
  LostFoundItem,
  StudySessionRsvp,
  LostFoundClaim,
};
