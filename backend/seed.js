require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const RollNumberCounter = require('./models/RollNumberCounter');
const {
  Course,
  User,
  CourseTeacher,
  Enrollment,
  CourseMaterial,
  LabReport,
  Quiz,
  QuizQuestion,
  QuizOption,
  StudySession,
  StudySessionRsvp,
  LostFoundItem,
  LostFoundClaim,
  MaterialBookmark
} = require('./models/associations');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Force sync to reset database (Drops all existing tables)
    await sequelize.sync({ force: true });
    console.log('Database schema reset and synced.');

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
        designation: 'Associate Professor',
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
      // Additional Teachers
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
      // Additional Students
      {
        name: 'Nabil Ahmed',
        email: 'nabil@campushive.com',
        passwordHash: defaultPassword,
        role: 'student',
        rollNumber: 'CSE-2022-001',
        department: 'CSE',
        batch: '2022-2023',
        phone: '01712345688',
      },
      {
        name: 'Laila Chowdhury',
        email: 'laila@campushive.com',
        passwordHash: defaultPassword,
        role: 'student',
        rollNumber: 'CSE-2022-002',
        department: 'CSE',
        batch: '2022-2023',
        phone: '01712345687',
      },
      {
        name: 'Abrar Fahim',
        email: 'abrar@campushive.com',
        passwordHash: defaultPassword,
        role: 'student',
        rollNumber: 'EEE-2023-001',
        department: 'EEE',
        batch: '2023-2024',
        phone: '01712345677',
      }
    ];

    const createdUsers = await User.bulkCreate(users, { returning: true });
    console.log('Seeded Users (Admins, Teachers, Students).');

    // Helper functions to get IDs
    const getUserId = (email) => createdUsers.find(u => u.email === email).id;

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
      }
    ];

    const createdCourses = await Course.bulkCreate(courses, { returning: true });
    console.log('Seeded Academic Courses.');

    const getCourseId = (code) => createdCourses.find(c => c.code === code).id;

    // 3. Seed CourseTeacher assignments (Associate 'teacher@campushive.com' directly with CSE-3106 and CSE-2203)
    const initialAssignments = [
      { courseId: getCourseId('CSE-3106'), teacherId: getUserId('teacher@campushive.com') },
      { courseId: getCourseId('CSE-2203'), teacherId: getUserId('teacher@campushive.com') },
      { courseId: getCourseId('CSE-3106'), teacherId: getUserId('samia.akhter@campushive.edu') },
      { courseId: getCourseId('CSE-1201'), teacherId: getUserId('samia.akhter@campushive.edu') },
      { courseId: getCourseId('EEE-1101'), teacherId: getUserId('tanvirul.islam@campushive.edu') },
    ];

    await CourseTeacher.bulkCreate(initialAssignments);
    console.log('Seeded Course-Teacher Assignments.');

    // 4. Seed Student Enrollments
    const enrollments = [
      // Primary student enrolled in multiple courses
      { courseId: getCourseId('CSE-3106'), studentId: getUserId('student@campushive.com') },
      { courseId: getCourseId('CSE-1201'), studentId: getUserId('student@campushive.com') },
      { courseId: getCourseId('CSE-2203'), studentId: getUserId('student@campushive.com') },
      { courseId: getCourseId('EEE-1101'), studentId: getUserId('student@campushive.com') },
      // Other students enrolled in courses
      { courseId: getCourseId('CSE-3106'), studentId: getUserId('nabil@campushive.com') },
      { courseId: getCourseId('CSE-3106'), studentId: getUserId('laila@campushive.com') },
      { courseId: getCourseId('EEE-1101'), studentId: getUserId('abrar@campushive.com') },
    ];

    await Enrollment.bulkCreate(enrollments);
    console.log('Seeded Student Enrollments.');

    // 5. Seed Course Materials (Learning materials uploaded by teacher@campushive.com)
    const materials = [
      {
        courseId: getCourseId('CSE-3106'),
        teacherId: getUserId('teacher@campushive.com'),
        title: 'Week 1: Introduction to Software Engineering & SDLC',
        category: 'Lecture Notes',
        filePath: 'uploads/week1_intro.pdf',
        originalFileName: 'week1_intro.pdf',
        fileSize: 4200000,
        fileType: 'pdf',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        courseId: getCourseId('CSE-3106'),
        teacherId: getUserId('teacher@campushive.com'),
        title: 'Software Requirements Specification (SRS) Guidelines',
        category: 'Assignment',
        filePath: 'uploads/srs_guidelines.docx',
        originalFileName: 'srs_guidelines.docx',
        fileSize: 180000,
        fileType: 'docx',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        courseId: getCourseId('CSE-2203'),
        teacherId: getUserId('teacher@campushive.com'),
        title: 'Relational Database Schema Design slides',
        category: 'Lecture Notes',
        filePath: 'uploads/db_relations.pdf',
        originalFileName: 'db_relations.pdf',
        fileSize: 5200000,
        fileType: 'pdf',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        courseId: getCourseId('CSE-1201'),
        teacherId: getUserId('samia.akhter@campushive.edu'),
        title: 'Week 1: Array Operations and Time Complexity',
        category: 'Lecture Notes',
        filePath: 'uploads/week1_arrays.pdf',
        originalFileName: 'week1_arrays.pdf',
        fileSize: 3100000,
        fileType: 'pdf',
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    const seededMaterials = await CourseMaterial.bulkCreate(materials, { returning: true });
    console.log('Seeded Course Learning Materials.');

    // Bookmark some files for student@campushive.com
    await MaterialBookmark.create({
      studentId: getUserId('student@campushive.com'),
      materialId: seededMaterials[0].id,
    });
    console.log('Seeded Student Bookmarks.');

    // 6. Seed Student Lab Reports (LabTrack submissions)
    const reports = [
      {
        studentId: getUserId('student@campushive.com'),
        courseId: getCourseId('CSE-3106'),
        title: 'Lab Report 1: SRS Submission',
        description: 'Complete Software Requirements Specification document for the CampusHive project.',
        filePath: 'uploads/student-srs-v1.pdf',
        originalFileName: 'student-srs-v1.pdf',
        fileSize: 1045000,
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'graded',
        grade: 'A',
        feedback: 'Excellent work. Detail description and UML diagrams are well constructed.'
      },
      {
        studentId: getUserId('nabil@campushive.com'),
        courseId: getCourseId('CSE-3106'),
        title: 'Lab Report 1: SRS Draft',
        description: 'UML class diagrams and requirement matrix.',
        filePath: 'uploads/nabil-srs.pdf',
        originalFileName: 'nabil-srs.pdf',
        fileSize: 720000,
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'submitted',
      },
      {
        studentId: getUserId('student@campushive.com'),
        courseId: getCourseId('CSE-2203'),
        title: 'Lab 1: SQL queries and joins report',
        description: 'Implementation of primary/foreign keys and subqueries.',
        filePath: 'uploads/db_joins.pdf',
        originalFileName: 'db_joins.pdf',
        fileSize: 610000,
        submittedAt: new Date(),
        status: 'submitted',
      },
      {
        studentId: getUserId('student@campushive.com'),
        courseId: getCourseId('CSE-1201'),
        title: 'Lab 2: Binary Search Tree Implementation',
        description: 'Implemented standard recursive BST insertions and traversals in C++.',
        filePath: 'uploads/bst_cpp.pdf',
        originalFileName: 'bst_cpp.pdf',
        fileSize: 852000,
        submittedAt: new Date(),
        status: 'submitted',
      }
    ];

    await LabReport.bulkCreate(reports);
    console.log('Seeded Lab Report Submissions.');

    // 7. Seed Quizzes created by teacher@campushive.com
    const activeQuiz = await Quiz.create({
      courseId: getCourseId('CSE-3106'),
      teacherId: getUserId('teacher@campushive.com'),
      title: 'Scrum & Agile Development Quiz',
      timeLimitPerQuestion: 20,
      status: 'launched'
    });

    const quizQuestion = await QuizQuestion.create({
      quizId: activeQuiz.id,
      questionText: 'Which Scrum event is held daily to synchronize activities and plan for the next 24 hours?',
      order: 1
    });

    await QuizOption.bulkCreate([
      { questionId: quizQuestion.id, optionText: 'Sprint Review', isCorrect: false },
      { questionId: quizQuestion.id, optionText: 'Daily Scrum', isCorrect: true },
      { questionId: quizQuestion.id, optionText: 'Sprint Retrospective', isCorrect: false },
      { questionId: quizQuestion.id, optionText: 'Sprint Planning', isCorrect: false }
    ]);

    await Quiz.create({
      courseId: getCourseId('CSE-3106'),
      teacherId: getUserId('teacher@campushive.com'),
      title: 'Software Architecture Concepts',
      timeLimitPerQuestion: 30,
      status: 'closed'
    });

    await Quiz.create({
      courseId: getCourseId('CSE-2203'),
      teacherId: getUserId('teacher@campushive.com'),
      title: 'Entity-Relationship Diagrams Quiz',
      timeLimitPerQuestion: 25,
      status: 'draft'
    });
    console.log('Seeded Quizzes, Questions, and Options.');

    // 8. Seed Study Sessions
    const session1 = await StudySession.create({
      creatorId: getUserId('student@campushive.com'),
      courseId: getCourseId('CSE-3106'),
      title: 'Design Patterns & UML Diagrams Review',
      description: 'Let us sit together to review MVC, Singleton, and Factory patterns for the upcoming midterm.',
      location: 'CSE Building Room 402',
      sessionDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      maxParticipants: 6
    });

    const session2 = await StudySession.create({
      creatorId: getUserId('nabil@campushive.com'),
      courseId: getCourseId('CSE-1201'),
      title: 'Red-Black Trees Traversals Bootcamp',
      description: 'Solving complex insertions and rotations on trees.',
      location: 'Central Library Ground Floor',
      sessionDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      maxParticipants: 4
    });

    // RSVPs
    await StudySessionRsvp.create({ sessionId: session1.id, studentId: getUserId('nabil@campushive.com') });
    await StudySessionRsvp.create({ sessionId: session1.id, studentId: getUserId('laila@campushive.com') });
    await StudySessionRsvp.create({ sessionId: session2.id, studentId: getUserId('student@campushive.com') });
    console.log('Seeded Student Study Sessions & RSVPs.');

    // 9. Seed Lost & Found Items
    const lostItem = await LostFoundItem.create({
      reporterId: getUserId('nabil@campushive.com'),
      type: 'lost',
      title: 'Black HP USB-C Laptop Charger',
      description: 'Left it plugged in next to the white board in CSE Lab 3 on Sunday afternoon. Please return if found.',
      category: 'Electronics',
      location: 'CSE Lab 3, 3rd Floor',
      itemDate: '2026-07-18',
      status: 'open'
    });

    const foundItem = await LostFoundItem.create({
      reporterId: getUserId('laila@campushive.com'),
      type: 'found',
      title: 'Keys with Pikachu Keychain',
      description: 'Found a bunch of keys on the cafeteria table during lunch. Claim item below to coordinate return.',
      category: 'Keys/Accessories',
      location: 'Main Cafeteria, North Wing',
      itemDate: '2026-07-19',
      status: 'open'
    });

    // Claims
    await LostFoundClaim.create({
      itemId: foundItem.id,
      claimantId: getUserId('student@campushive.com'),
      message: 'I lost my keys with a Pikachu keychain there yesterday! I can describe the rest of the keys to verify.',
      status: 'pending'
    });
    console.log('Seeded Lost & Found Items and Claim Requests.');

    // Initialize RollNumberCounter for generator
    await RollNumberCounter.findOrCreate({
      where: { department: 'CSE', batch: '2022-2023' },
      defaults: { lastSequence: 2 }
    });

    console.log('\n======================================================');
    console.log('Database Seeding Completed Successfully!');
    console.log('======================================================');
    console.log('Test Credentials:');
    console.log('  Admin   -> Email: admin@campushive.com   | Pass: admin123');
    console.log('  Teacher -> Email: teacher@campushive.com | Pass: teacher123');
    console.log('  Student -> Email: student@campushive.com | Pass: student123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
