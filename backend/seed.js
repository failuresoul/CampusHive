require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const RollNumberCounter = require('./models/RollNumberCounter');
const { Course, User, CourseTeacher } = require('./models/associations');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Force sync to reset database (CAUTION: Drops existing tables)
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    const saltRounds = 10;
    const defaultPassword = await bcrypt.hash('password123', saltRounds);
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const teacherPassword = await bcrypt.hash('teacher123', saltRounds);
    const studentPassword = await bcrypt.hash('student123', saltRounds);

    // 1. Seed Users (Admins, Teachers, Students)
    const users = [
      {
        name: 'Admin User',
        email: 'admin@campushive.com',
        passwordHash: adminPassword,
        role: 'admin',
      },
      {
        name: 'Generic Teacher',
        email: 'teacher@campushive.com',
        passwordHash: teacherPassword,
        role: 'teacher',
        department: 'CSE',
        designation: 'Lecturer',
        phone: '01712345600',
      },
      {
        name: 'Student User',
        email: 'student@campushive.com',
        passwordHash: studentPassword,
        role: 'student',
        rollNumber: 'CSE-2022-000',
        department: 'CSE',
        batch: '2022-2023',
        phone: '01712345699',
      },
      // Detailed teachers for search / multiselect
      {
        name: 'Dr. Anisur Rahman',
        email: 'anisur.rahman@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'CSE',
        designation: 'Professor',
        phone: '01712345601',
      },
      {
        name: 'Samia Akhter',
        email: 'samia.akhter@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'CSE',
        designation: 'Assistant Professor',
        phone: '01712345602',
      },
      {
        name: 'Tanvirul Islam',
        email: 'tanvirul.islam@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'EEE',
        designation: 'Lecturer',
        phone: '01712345603',
      },
      {
        name: 'Dr. Farhana Jasmine',
        email: 'farhana.jasmine@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'ME',
        designation: 'Associate Professor',
        phone: '01712345604',
      },
      {
        name: 'Kamrul Hasan',
        email: 'kamrul.hasan@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'CSE',
        designation: 'Lecturer',
        phone: '01712345605',
      },
      {
        name: 'Tasnim Alam',
        email: 'tasnim.alam@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'ENG',
        designation: 'Lecturer',
        phone: '01712345606',
      },
      {
        name: 'Ziaur Rahman',
        email: 'ziaur.rahman@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'BBA',
        designation: 'Associate Professor',
        phone: '01712345607',
      },
      {
        name: 'Nusrat Jahan',
        email: 'nusrat.jahan@campushive.edu',
        passwordHash: defaultPassword,
        role: 'teacher',
        department: 'CE',
        designation: 'Assistant Professor',
        phone: '01712345608',
      }
    ];

    const createdUsers = await User.bulkCreate(users, { returning: true });
    console.log('Seeded Users.');

    // 2. Seed Courses
    const courses = [
      {
        code: 'CSE-3106',
        title: 'Software Engineering',
        department: 'CSE',
        creditHours: 3,
        batchSemester: '2022-2023',
        description: 'Principles, methods, and tools for designing and building large-scale software systems.',
      },
      {
        code: 'CSE-1201',
        title: 'Data Structures',
        department: 'CSE',
        creditHours: 4,
        batchSemester: '2023-2024',
        description: 'Introduction to basic data structures: arrays, linked lists, stacks, queues, trees, graphs, and hash tables.',
      },
      {
        code: 'CSE-2203',
        title: 'Database Management Systems',
        department: 'CSE',
        creditHours: 3,
        batchSemester: '2022-2023',
        description: 'Relational model, database design, query languages, and transaction processing concepts.',
      },
      {
        code: 'EEE-1101',
        title: 'Electrical Circuits',
        department: 'EEE',
        creditHours: 3,
        batchSemester: '2023-2024',
        description: 'Fundamental laws, network theorems, and analysis of DC and AC circuits.',
      },
      {
        code: 'ME-2101',
        title: 'Fluid Mechanics',
        department: 'ME',
        creditHours: 3,
        batchSemester: '2022-2023',
        description: 'Fluid statics, dynamics, Bernoulli equation, momentum equations, and viscous flows.',
      },
      {
        code: 'ENG-1101',
        title: 'Introduction to Literature',
        department: 'ENG',
        creditHours: 3,
        batchSemester: '2024-2025',
        description: 'Analysis of key poems, plays, novels, and short stories from different literary eras.',
      },
      {
        code: 'BBA-1202',
        title: 'Principles of Marketing',
        department: 'BBA',
        creditHours: 3,
        batchSemester: '2023-2024',
        description: 'Study of marketing concepts, customer relationships, marketing environment, and strategies.',
      },
      {
        code: 'CE-3101',
        title: 'Structural Analysis',
        department: 'CE',
        creditHours: 4,
        batchSemester: '2021-2022',
        description: 'Analysis of statically determinate and indeterminate beams, trusses, and frames.',
      }
    ];

    const createdCourses = await Course.bulkCreate(courses, { returning: true });
    console.log('Seeded Courses.');

    // 3. Seed CourseTeacher assignments
    // Map seeded records to their generated IDs
    const findTeacherId = (email) => createdUsers.find(u => u.email === email).id;
    const findCourseId = (code) => createdCourses.find(c => c.code === code).id;

    const initialAssignments = [
      { courseId: findCourseId('CSE-3106'), teacherId: findTeacherId('anisur.rahman@campushive.edu') },
      { courseId: findCourseId('CSE-3106'), teacherId: findTeacherId('samia.akhter@campushive.edu') },
      { courseId: findCourseId('CSE-1201'), teacherId: findTeacherId('samia.akhter@campushive.edu') },
      { courseId: findCourseId('EEE-1101'), teacherId: findTeacherId('tanvirul.islam@campushive.edu') },
      { courseId: findCourseId('ENG-1101'), teacherId: findTeacherId('tasnim.alam@campushive.edu') },
      { courseId: findCourseId('BBA-1202'), teacherId: findTeacherId('ziaur.rahman@campushive.edu') },
      { courseId: findCourseId('CE-3101'), teacherId: findTeacherId('nusrat.jahan@campushive.edu') },
    ];

    await CourseTeacher.bulkCreate(initialAssignments);
    console.log('Seeded initial course-teacher assignments.');

    console.log('\nTest Credentials:');
    console.log('-----------------');
    createdUsers.slice(0, 3).forEach(u => {
      console.log(`Email: ${u.email} | Password: ${u.role}123 | Role: ${u.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
