const Course = require('./Course');
const User = require('./User');
const CourseTeacher = require('./CourseTeacher');
const Enrollment = require('./Enrollment');

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

module.exports = {
  Course,
  User,
  CourseTeacher,
  Enrollment,
};

