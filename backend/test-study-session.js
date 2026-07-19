const sequelize = require('./config/database');
const { Course, User, Enrollment, StudySession } = require('./models/associations');

async function runTests() {
  console.log('--- Starting Study Session API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // Sync database and ensure test users exist
    await sequelize.sync();

    const student = await User.findOne({ where: { email: 'student@campushive.com' } });
    const teacher = await User.findOne({ where: { email: 'teacher@campushive.com' } });
    const courses = await Course.findAll();

    if (!student || !teacher || courses.length < 2) {
      throw new Error('Required seeded database elements not found. Please run seed script first.');
    }

    const enrolledCourse = courses[0];
    const unenrolledCourse = courses[1];

    console.log(`Enrolled Course: ${enrolledCourse.code}`);
    console.log(`Unenrolled Course: ${unenrolledCourse.code}`);

    // Ensure student is enrolled in enrolledCourse
    await Enrollment.findOrCreate({
      where: { studentId: student.id, courseId: enrolledCourse.id }
    });

    // Ensure student is NOT enrolled in unenrolledCourse
    await Enrollment.destroy({
      where: { studentId: student.id, courseId: unenrolledCourse.id }
    });

    // Logins to obtain tokens
    console.log('Logging in as student...');
    const studentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campushive.com', password: 'student123' }),
    });
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.data.token;

    console.log('Logging in as teacher...');
    const teacherLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@campushive.com', password: 'teacher123' }),
    });
    const teacherLoginData = await teacherLoginRes.json();
    const teacherToken = teacherLoginData.data.token;

    // Test 1: No Token (Expected: 401)
    console.log('\nTest 1: No token authorization check...');
    const resNoToken = await fetch(`${baseUrl}/study-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Midterm Prep',
        courseId: enrolledCourse.id,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Library',
      }),
    });
    console.log('No Token Status:', resNoToken.status, '(Expected: 401)');
    if (resNoToken.status !== 401) throw new Error('Expected 401 for no token');

    // Test 2: Non-student Role (Expected: 403)
    console.log('\nTest 2: Role authorization check (Teacher)...');
    const resTeacher = await fetch(`${baseUrl}/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Midterm Prep',
        courseId: enrolledCourse.id,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Library',
      }),
    });
    console.log('Teacher Role Status:', resTeacher.status, '(Expected: 403)');
    if (resTeacher.status !== 403) throw new Error('Expected 403 for non-student');

    // Test 3: Unenrolled Course (Expected: 403)
    console.log('\nTest 3: Enrolled course validation check...');
    const resUnenrolled = await fetch(`${baseUrl}/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Study Session',
        courseId: unenrolledCourse.id,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        location: 'Library',
      }),
    });
    console.log('Unenrolled Course Status:', resUnenrolled.status, '(Expected: 403)');
    if (resUnenrolled.status !== 403) throw new Error('Expected 403 for course not enrolled in');

    // Test 4: Past Date (Expected: 400)
    console.log('\nTest 4: Past date validation check...');
    const resPastDate = await fetch(`${baseUrl}/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Retroactive Session',
        courseId: enrolledCourse.id,
        dateTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        location: 'Library',
      }),
    });
    console.log('Past Date Status:', resPastDate.status, '(Expected: 400)');
    const pastDateData = await resPastDate.json();
    console.log('Past Date response message:', pastDateData.message);
    if (resPastDate.status !== 400) throw new Error('Expected 400 for past date');

    // Test 5: Valid Creation (Expected: 201)
    console.log('\nTest 5: Valid study session creation...');
    const futureDate = new Date(Date.now() + 86400000); // 24 hours from now
    const resValid = await fetch(`${baseUrl}/study-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Midterm review for ' + enrolledCourse.code,
        courseId: enrolledCourse.id,
        dateTime: futureDate.toISOString(),
        location: 'Library Room 204',
        description: 'Review chapters 1-4. Bring laptops.',
        maxParticipants: 10,
      }),
    });
    console.log('Valid Session Creation Status:', resValid.status, '(Expected: 201)');
    const validData = await resValid.json();
    console.log('Response body:', validData);
    if (resValid.status !== 201 || !validData.success) throw new Error('Expected 201 for valid creation');

    // Clean up created study session
    if (validData.data && validData.data.id) {
      await StudySession.destroy({ where: { id: validData.data.id } });
      console.log('Cleaned up created test study session.');
    }

    console.log('\n--- All API Verification Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed with error:', error);
    process.exit(1);
  }
}

runTests();
