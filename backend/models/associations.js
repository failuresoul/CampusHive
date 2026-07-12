const Course = require('./Course');
const User = require('./User');
const CourseTeacher = require('./CourseTeacher');

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

module.exports = {
  Course,
  User,
  CourseTeacher,
};
