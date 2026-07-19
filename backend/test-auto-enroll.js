const sequelize = require('./config/database');
const { Course, User, Enrollment } = require('./models/associations');
const bcrypt = require('bcrypt');

async function runTests() {
  console.log('--- Starting Auto-Enroll API Verification Tests ---');

  let serverProcess;
  try {
    // 1. Setup extra students for verification (50 students)
    console.log('Generating test students in database...');
    const saltRounds = 1; // fast hashing for test
    const hash = await bcrypt.hash('student123', saltRounds);

    const testDept = 'CSE';
    const testBatch = '2023-2024';

    // Find the course matching CSE 2023-2024 (e.g. CSE-1201)
    const course = await Course.findOne({
      where: {
        department: testDept,
        batchSemester: testBatch,
      },
    });

    if (!course) {
      throw new Error('Test course not found. Run seed script first.');
    }

    console.log(`Found test course: ${course.code} - ${course.title} (${course.department}, ${course.batchSemester})`);

    // Delete any existing student users in this department + batch to have a clean count
    await User.destroy({
      where: {
        role: 'student',
        department: testDept,
        batch: testBatch,
      },
    });

    // Clean enrollments for this course
    await Enrollment.destroy({
      where: {
        courseId: course.id,
      },
    });

    // Create 50 students
    const studentsData = [];
    for (let i = 1; i <= 50; i++) {
      studentsData.push({
        name: `Test Student ${i}`,
        email: `teststudent${i}@campushive.edu`,
        passwordHash: hash,
        role: 'student',
        department: testDept,
        batch: testBatch,
        rollNumber: `CSE-2023-${String(i).padStart(3, '0')}`,
        status: 'active',
      });
    }
    await User.bulkCreate(studentsData);
    console.log('Created 50 test students successfully.');

    // 2. Start the Express Server
    console.log('Starting Express server...');
    const { spawn } = require('child_process');
    serverProcess = spawn('node', ['server.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: '5001' },
      shell: true,
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('Server started on port 5001.');

    const baseUrl = 'http://localhost:5001/api';

    // 3. Logins
    // Get Admin Token
    console.log('Logging in as admin...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@campushive.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.data.token;
    console.log('Admin logged in.');

    // Get Teacher Token
    console.log('Logging in as teacher...');
    const teacherLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@campushive.com', password: 'teacher123' }),
    });
    const teacherLoginData = await teacherLoginRes.json();
    const teacherToken = teacherLoginData.data.token;
    console.log('Teacher logged in.');

    // 4. Test Route Protection (Auth & Admin Role verification)
    console.log('Verifying route protections...');
    
    // Call GET /api/courses/:courseId/eligible-students with no token
    const resNoToken = await fetch(`${baseUrl}/courses/${course.id}/eligible-students`);
    console.log('No Token GET eligible-students Status:', resNoToken.status, '(Expected: 401)');
    if (resNoToken.status !== 401) throw new Error('Expected 401 for no token');

    // Call GET with non-admin token
    const resTeacherToken = await fetch(`${baseUrl}/courses/${course.id}/eligible-students`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` },
    });
    console.log('Teacher Token GET eligible-students Status:', resTeacherToken.status, '(Expected: 403)');
    if (resTeacherToken.status !== 403) throw new Error('Expected 403 for non-admin token');

    // Call POST /api/courses/:courseId/auto-enroll with teacher token
    const resTeacherEnroll = await fetch(`${baseUrl}/courses/${course.id}/auto-enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${teacherToken}` },
    });
    console.log('Teacher Token POST auto-enroll Status:', resTeacherEnroll.status, '(Expected: 403)');
    if (resTeacherEnroll.status !== 403) throw new Error('Expected 403 for non-admin token on auto-enroll');

    // 5. Verify Eligibility Preview (Expected: 50 eligible, 0 enrolled)
    console.log('Fetching eligible students preview (Admin)...');
    const resPreview = await fetch(`${baseUrl}/courses/${course.id}/eligible-students`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const previewData = await resPreview.json();
    
    console.log('Preview API Response Success:', previewData.success);
    const eligibleList = previewData.data.students.filter(s => s.status === 'Eligible');
    const enrolledList = previewData.data.students.filter(s => s.status === 'Already Enrolled');
    console.log(`Eligible Students Count: ${eligibleList.length} (Expected: 50)`);
    console.log(`Already Enrolled Students Count: ${enrolledList.length} (Expected: 0)`);
    console.log(`API reported alreadyEnrolledCount: ${previewData.data.alreadyEnrolledCount} (Expected: 0)`);

    if (eligibleList.length !== 50 || enrolledList.length !== 0 || previewData.data.alreadyEnrolledCount !== 0) {
      throw new Error('Eligibility preview verification failed!');
    }

    // 6. Run Auto-Enrollment (Expected: 50 newly enrolled)
    console.log('Triggering auto-enrollment...');
    const resEnroll = await fetch(`${baseUrl}/courses/${course.id}/auto-enroll`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
    });
    const enrollData = await resEnroll.json();
    console.log('Auto-Enroll Response:', enrollData);
    if (!enrollData.success || enrollData.data.enrolledCount !== 50 || enrollData.data.skippedCount !== 0) {
      throw new Error('Auto-enrollment response counts are incorrect!');
    }

    // 7. Verify Idempotency: Re-running immediately shows 0 newly eligible and returns enrolledCount: 0
    console.log('Re-fetching preview immediately after enrollment...');
    const resPreview2 = await fetch(`${baseUrl}/courses/${course.id}/eligible-students`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const previewData2 = await resPreview2.json();
    const eligibleList2 = previewData2.data.students.filter(s => s.status === 'Eligible');
    const enrolledList2 = previewData2.data.students.filter(s => s.status === 'Already Enrolled');
    console.log(`Post-enroll Eligible Students Count: ${eligibleList2.length} (Expected: 0)`);
    console.log(`Post-enroll Already Enrolled Students Count: ${enrolledList2.length} (Expected: 50)`);
    console.log(`Post-enroll API reported alreadyEnrolledCount: ${previewData2.data.alreadyEnrolledCount} (Expected: 50)`);

    if (eligibleList2.length !== 0 || enrolledList2.length !== 50 || previewData2.data.alreadyEnrolledCount !== 50) {
      throw new Error('Idempotency preview check failed!');
    }

    console.log('Re-running auto-enroll immediately...');
    const resEnroll2 = await fetch(`${baseUrl}/courses/${course.id}/auto-enroll`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const enrollData2 = await resEnroll2.json();
    console.log('Re-run Auto-Enroll Response:', enrollData2);
    if (!enrollData2.success || enrollData2.data.enrolledCount !== 0 || enrollData2.data.skippedCount !== 50) {
      throw new Error('Idempotency enroll check failed!');
    }

    // 8. Add a new student afterward and check eligibility (Expected: exactly 1 eligible student)
    console.log('Adding 1 new student to the department/batch...');
    await User.create({
      name: 'New Late Student',
      email: 'latestudent@campushive.edu',
      passwordHash: hash,
      role: 'student',
      department: testDept,
      batch: testBatch,
      rollNumber: `CSE-2023-999`,
      status: 'active',
    });

    console.log('Re-checking preview after adding new student...');
    const resPreview3 = await fetch(`${baseUrl}/courses/${course.id}/eligible-students`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    const previewData3 = await resPreview3.json();
    const eligibleList3 = previewData3.data.students.filter(s => s.status === 'Eligible');
    const enrolledList3 = previewData3.data.students.filter(s => s.status === 'Already Enrolled');
    console.log(`Post-new-student Eligible Students Count: ${eligibleList3.length} (Expected: 1)`);
    console.log(`Post-new-student Already Enrolled Students Count: ${enrolledList3.length} (Expected: 50)`);

    if (eligibleList3.length !== 1 || enrolledList3.length !== 50) {
      throw new Error('New student eligibility check failed!');
    }

    // 9. Verify Database contains no duplicates
    console.log('Checking database for duplicates in Enrollments table...');
    const dbCount = await Enrollment.count({
      where: { courseId: course.id }
    });
    console.log(`Total database enrollment rows for this course: ${dbCount} (Expected: 50)`);
    if (dbCount !== 50) {
      throw new Error('Database contains duplicate enrollment rows!');
    }

    console.log('\n>>> ALL VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');

  } catch (error) {
    console.error('\n!!! TEST RUN ENCOUNTERED AN ERROR !!!');
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      console.log('Stopping test server...');
      serverProcess.kill();
    }
    // Clean up temporary database records
    console.log('Cleaning up database...');
    await sequelize.query('PRAGMA foreign_keys = OFF');
    try {
      const usersToDelete = await User.findAll({
        where: {
          email: {
            [sequelize.Sequelize.Op.like]: '%@campushive.edu'
          }
        }
      });
      const userIds = usersToDelete.map(u => u.id);
      if (userIds.length > 0) {
        await Enrollment.destroy({
          where: {
            studentId: userIds
          }
        });
        await User.destroy({
          where: {
            id: userIds
          }
        });
      }
    } finally {
      await sequelize.query('PRAGMA foreign_keys = ON');
    }
    console.log('Database cleaned. Done.');
    process.exit();
  }
}

runTests();
