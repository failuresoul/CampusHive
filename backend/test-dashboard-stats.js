const sequelize = require('./config/database');
const { User, Course, Enrollment, CourseTeacher, LabReport } = require('./models/associations');
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
    { expiresIn: '1h' }
  );
}

async function runDashboardTests() {
  console.log('--- Starting Dashboard Stats API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api/dashboard';

  let testCourse = null;
  let testTeacher = null;
  let testStudent = null;
  let testAdmin = null;

  let adminToken = null;
  let teacherToken = null;
  let studentToken = null;

  try {
    await sequelize.sync();

    // Setup entities
    console.log('Setting up database test entities...');

    [testAdmin] = await User.findOrCreate({
      where: { email: 'dashboard-admin@campushive.edu' },
      defaults: { name: 'Dashboard Admin', passwordHash: 'dummy', role: 'admin' }
    });

    [testTeacher] = await User.findOrCreate({
      where: { email: 'dashboard-teacher@campushive.edu' },
      defaults: { name: 'Dashboard Teacher', passwordHash: 'dummy', role: 'teacher', department: 'CSE' }
    });

    [testStudent] = await User.findOrCreate({
      where: { email: 'dashboard-student@campushive.edu' },
      defaults: { name: 'Dashboard Student', passwordHash: 'dummy', role: 'student', department: 'CSE', rollNumber: 'DB-001' }
    });

    [testCourse] = await Course.findOrCreate({
      where: { code: 'DBST-9999' },
      defaults: { title: 'Dashboard Test Course', department: 'CSE', creditHours: 3, batchSemester: '3-1' }
    });

    // Assignments
    await CourseTeacher.findOrCreate({
      where: { courseId: testCourse.id, teacherId: testTeacher.id }
    });

    await Enrollment.findOrCreate({
      where: { courseId: testCourse.id, studentId: testStudent.id }
    });

    // Create a graded lab report to verify student GPA calculation
    await LabReport.destroy({ where: { studentId: testStudent.id } });
    await LabReport.create({
      studentId: testStudent.id,
      courseId: testCourse.id,
      title: 'Lab 1',
      filePath: 'dummy/path',
      originalFileName: 'lab1.pdf',
      fileSize: 100,
      status: 'graded',
      grade: 'A',
    });

    adminToken = generateToken(testAdmin);
    teacherToken = generateToken(testTeacher);
    studentToken = generateToken(testStudent);

    // --- TEST 1: Admin Stats Endpoint (Expected: 200 OK) ---
    console.log('\nTest 1: Fetching Admin Dashboard stats...');
    const resAdmin = await fetch(`${baseUrl}/admin`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Admin Status:', resAdmin.status, '(Expected: 200)');
    const adminData = await resAdmin.json();
    console.log('Admin Data payload:', adminData.data);
    if (resAdmin.status !== 200 || !adminData.success || adminData.data.totalUsers === undefined) {
      throw new Error('Admin Dashboard stats API failed');
    }

    // --- TEST 2: Teacher Stats Endpoint (Expected: 200 OK) ---
    console.log('\nTest 2: Fetching Teacher Dashboard stats...');
    const resTeacher = await fetch(`${baseUrl}/teacher`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    console.log('Teacher Status:', resTeacher.status, '(Expected: 200)');
    const teacherData = await resTeacher.json();
    console.log('Teacher Data payload:', teacherData.data);
    if (
      resTeacher.status !== 200 || 
      !teacherData.success || 
      teacherData.data.coursesCount === 0 || 
      teacherData.data.courses[0].code !== 'DBST-9999'
    ) {
      throw new Error('Teacher Dashboard stats API failed');
    }

    // --- TEST 3: Student Stats Endpoint (Expected: 200 OK, GPA = 4.00) ---
    console.log('\nTest 3: Fetching Student Dashboard stats...');
    const resStudent = await fetch(`${baseUrl}/student`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log('Student Status:', resStudent.status, '(Expected: 200)');
    const studentData = await resStudent.json();
    console.log('Student Data payload:', studentData.data);
    if (resStudent.status !== 200 || !studentData.success || studentData.data.gpa !== '4.00') {
      throw new Error('Student Dashboard stats API failed');
    }

    // --- TEST 4: Authority boundaries - Student accessing Admin stats (Expected: 403) ---
    console.log('\nTest 4: Checking role protection (student calling admin dashboard)...');
    const resForbidden = await fetch(`${baseUrl}/admin`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    console.log('Status:', resForbidden.status, '(Expected: 403)');
    if (resForbidden.status !== 403) {
      throw new Error('Allowed student to access admin stats');
    }

    console.log('\n--- All Dashboard Stats API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    console.log('Cleaning up test data...');
    await sequelize.query('PRAGMA foreign_keys = OFF');
    try {
      if (testCourse) {
        await CourseTeacher.destroy({ where: { courseId: testCourse.id } });
        await Enrollment.destroy({ where: { courseId: testCourse.id } });
        await Course.destroy({ where: { id: testCourse.id } });
      }
      if (testAdmin) await User.destroy({ where: { id: testAdmin.id } });
      if (testTeacher) await User.destroy({ where: { id: testTeacher.id } });
      if (testStudent) {
        await LabReport.destroy({ where: { studentId: testStudent.id } });
        await User.destroy({ where: { id: testStudent.id } });
      }
    } finally {
      await sequelize.query('PRAGMA foreign_keys = ON');
    }
  }
}

runDashboardTests();
