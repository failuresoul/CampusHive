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
    const createdSessionId = validData.data.id;

    // Direct Database Insertion for past session (bypassing validation checks to create test case)
    console.log('Creating a past study session directly in database for validation filters...');
    const pastSession = await StudySession.create({
      title: 'Past Exam Study Group',
      courseId: enrolledCourse.id,
      creatorId: student.id,
      location: 'Library Room 101',
      sessionDateTime: new Date(Date.now() - 172800000), // 2 days ago
      maxParticipants: 5,
    });

    // Test 6: GET study sessions - No Token (Expected: 401)
    console.log('\nTest 6: GET study sessions with no auth token...');
    const resGetNoToken = await fetch(`${baseUrl}/study-sessions`);
    console.log('GET No Token Status:', resGetNoToken.status, '(Expected: 401)');
    if (resGetNoToken.status !== 401) throw new Error('Expected 401 for GET without token');

    // Test 7: GET study sessions - Valid Token, Default Upcoming (Expected: 200, excludes pastSession)
    console.log('\nTest 7: GET study sessions (default upcoming=true)...');
    const resGetDefault = await fetch(`${baseUrl}/study-sessions`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    console.log('GET Default Status:', resGetDefault.status, '(Expected: 200)');
    const getDataDefault = await resGetDefault.json();
    console.log('Returned sessions count:', getDataDefault.data.sessions.length);
    
    // Ensure past session is NOT in default list
    const hasPastInDefault = getDataDefault.data.sessions.some(s => s.id === pastSession.id);
    console.log('Contains past session in upcoming list:', hasPastInDefault, '(Expected: false)');
    if (hasPastInDefault) throw new Error('Default upcoming=true list should not contain past sessions');

    // Ensure session properties match spec (rsvpCount, creator name, course details)
    if (getDataDefault.data.sessions.length > 0) {
      const first = getDataDefault.data.sessions[0];
      console.log('Properties check: rsvpCount exists:', first.rsvpCount !== undefined, first.rsvpCount);
      console.log('Properties check: creator name exists:', first.creator && typeof first.creator.name === 'string');
      console.log('Properties check: course details exists:', first.course && typeof first.course.code === 'string');
      if (first.rsvpCount !== 0) throw new Error('Expected placeholder rsvpCount to be 0');
    }

    // Test 8: GET study sessions - Show Past (Expected: 200, includes pastSession)
    console.log('\nTest 8: GET study sessions (upcoming=false)...');
    const resGetPast = await fetch(`${baseUrl}/study-sessions?upcoming=false`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    console.log('GET with upcoming=false Status:', resGetPast.status, '(Expected: 200)');
    const getDataPast = await resGetPast.json();
    const hasPastInAll = getDataPast.data.sessions.some(s => s.id === pastSession.id);
    console.log('Contains past session in all list:', hasPastInAll, '(Expected: true)');
    if (!hasPastInAll) throw new Error('GET upcoming=false list should contain past sessions');

    // Test 9: GET study sessions - Course filter
    console.log('\nTest 9: GET study sessions filtered by courseId...');
    const resGetFiltered = await fetch(`${baseUrl}/study-sessions?courseId=${unenrolledCourse.id}&upcoming=false`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const getDataFiltered = await resGetFiltered.json();
    console.log('Filtered sessions count:', getDataFiltered.data.sessions.length);
    const hasOtherCourse = getDataFiltered.data.sessions.some(s => s.courseId !== unenrolledCourse.id);
    console.log('Contains sessions from other courses:', hasOtherCourse, '(Expected: false)');
    if (hasOtherCourse) throw new Error('Course filter returned study sessions from other courses');

    // Clean up created study sessions
    await StudySession.destroy({ where: { id: createdSessionId } });
    await StudySession.destroy({ where: { id: pastSession.id } });
    console.log('\nCleaned up created test study sessions.');

    console.log('\n--- All API Verification Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed with error:', error);
    process.exit(1);
  }
}

runTests();
