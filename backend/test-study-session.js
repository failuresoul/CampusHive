const sequelize = require('./config/database');
const { Course, User, Enrollment, StudySession, StudySessionRsvp } = require('./models/associations');
const bcrypt = require('bcrypt');

async function runTests() {
  console.log('--- Starting Study Session & RSVP API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';
  let createdSessionId = null;
  let testSessionId = null;
  let student2Id = null;

  try {
    // Sync database and ensure test users exist
    await sequelize.sync();

    // Clean up any stale test records from previous runs
    await User.destroy({ where: { email: 'student2@campushive.com' } });

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
    createdSessionId = validData.data.id;

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

    // Test 10: GET study session details - No Token (Expected: 401)
    console.log('\nTest 10: GET session details without token...');
    const resDetailsNoToken = await fetch(`${baseUrl}/study-sessions/${createdSessionId}`);
    console.log('GET Details No Token Status:', resDetailsNoToken.status, '(Expected: 401)');
    if (resDetailsNoToken.status !== 401) throw new Error('Expected 401 for GET details without token');

    // Test 11: GET study session details - Valid (Expected: 200)
    console.log('\nTest 11: GET session details with valid token...');
    const resDetails = await fetch(`${baseUrl}/study-sessions/${createdSessionId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    console.log('GET Details Status:', resDetails.status, '(Expected: 200)');
    const detailsData = await resDetails.json();
    console.log('Details payload contains rsvpCount & hasRsvpd:', detailsData.data.rsvpCount !== undefined, detailsData.data.hasRsvpd);
    if (resDetails.status !== 200 || !detailsData.success) throw new Error('Expected 200 for details retrieval');

    // Test 12: POST RSVP to session (Expected: 201)
    console.log('\nTest 12: RSVP to study session...');
    const resRsvp = await fetch(`${baseUrl}/study-sessions/${createdSessionId}/rsvp`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('RSVP Status:', resRsvp.status, '(Expected: 201)');
    const rsvpData = await resRsvp.json();
    console.log('RSVP response payload:', rsvpData);
    if (resRsvp.status !== 201) throw new Error('Expected 201 for RSVP');

    // Test 13: POST RSVP again (duplicate) (Expected: 409)
    console.log('\nTest 13: RSVP duplicate checking...');
    const resRsvpDup = await fetch(`${baseUrl}/study-sessions/${createdSessionId}/rsvp`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('Duplicate RSVP Status:', resRsvpDup.status, '(Expected: 409)');
    if (resRsvpDup.status !== 409) throw new Error('Expected 409 for duplicate RSVP');

    // Verify detail endpoint shows updated rsvpCount and hasRsvpd = true
    const resDetailsAfterRsvp = await fetch(`${baseUrl}/study-sessions/${createdSessionId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const detailsAfterRsvpData = await resDetailsAfterRsvp.json();
    console.log('Count after RSVP:', detailsAfterRsvpData.data.rsvpCount, '(Expected: 1)');
    console.log('hasRsvpd after RSVP:', detailsAfterRsvpData.data.hasRsvpd, '(Expected: true)');
    console.log('Attendees list name count:', detailsAfterRsvpData.data.participants.length, '(Expected: 1)');
    if (detailsAfterRsvpData.data.rsvpCount !== 1 || !detailsAfterRsvpData.data.hasRsvpd) {
      throw new Error('RSVP details synchronization failed');
    }

    // Test 14: DELETE cancel RSVP (Expected: 200)
    console.log('\nTest 14: Cancel RSVP...');
    const resCancel = await fetch(`${baseUrl}/study-sessions/${createdSessionId}/rsvp`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    console.log('Cancel RSVP Status:', resCancel.status, '(Expected: 200)');
    if (resCancel.status !== 200) throw new Error('Expected 200 for Cancel RSVP');

    // Verify detail endpoint shows count = 0, hasRsvpd = false
    const resDetailsAfterCancel = await fetch(`${baseUrl}/study-sessions/${createdSessionId}`, {
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const detailsAfterCancelData = await resDetailsAfterCancel.json();
    console.log('Count after cancellation:', detailsAfterCancelData.data.rsvpCount, '(Expected: 0)');
    console.log('hasRsvpd after cancellation:', detailsAfterCancelData.data.hasRsvpd, '(Expected: false)');
    if (detailsAfterCancelData.data.rsvpCount !== 0 || detailsAfterCancelData.data.hasRsvpd) {
      throw new Error('Cancellation details synchronization failed');
    }

    // Test 15: DELETE cancel RSVP when none exists (Expected: 404)
    console.log('\nTest 15: Cancel RSVP when none exists...');
    const resCancelNone = await fetch(`${baseUrl}/study-sessions/${createdSessionId}/rsvp`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    console.log('Cancel Non-existing RSVP Status:', resCancelNone.status, '(Expected: 404)');
    if (resCancelNone.status !== 404) throw new Error('Expected 404 for cancelling non-existent RSVP');

    // Test 16: POST RSVP to past session (Expected: 400)
    console.log('\nTest 16: RSVP to a past study session...');
    const resRsvpPast = await fetch(`${baseUrl}/study-sessions/${pastSession.id}/rsvp`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('RSVP to Past Session Status:', resRsvpPast.status, '(Expected: 400)');
    if (resRsvpPast.status !== 400) throw new Error('Expected 400 for RSVP to past session');

    // Test 17: Concurrent RSVPs (Race Condition check)
    console.log('\nTest 17: Concurrent RSVP race condition validation...');
    
    // Create a temporary session with maxParticipants = 1
    const limitSession = await StudySession.create({
      title: 'Limited spots review',
      courseId: enrolledCourse.id,
      creatorId: student.id,
      location: 'Library',
      sessionDateTime: new Date(Date.now() + 86400000), // tomorrow
      maxParticipants: 1,
    });
    testSessionId = limitSession.id;

    // Create a second student user in database dynamically
    const hash = await bcrypt.hash('student2_123', 1); // fast hashing
    const student2 = await User.create({
      name: 'Second Student User',
      email: 'student2@campushive.com',
      passwordHash: hash,
      role: 'student',
      rollNumber: 'CSE-2022-099',
      department: 'CSE',
      batch: '2022-2023',
    });
    student2Id = student2.id;

    // Enroll second student
    await Enrollment.create({ studentId: student2.id, courseId: enrolledCourse.id });

    // Login second student to obtain token
    const student2LoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student2@campushive.com', password: 'student2_123' }),
    });
    const student2LoginData = await student2LoginRes.json();
    const student2Token = student2LoginData.data.token;

    // Dispatch concurrent requests simultaneously
    console.log('Sending two concurrent RSVP requests to a 1-spot study session...');
    const req1 = fetch(`${baseUrl}/study-sessions/${limitSession.id}/rsvp`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${studentToken}` },
    });
    const req2 = fetch(`${baseUrl}/study-sessions/${limitSession.id}/rsvp`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${student2Token}` },
    });

    const [response1, response2] = await Promise.all([req1, req2]);
    console.log(`Student 1 status: ${response1.status}`);
    console.log(`Student 2 status: ${response2.status}`);

    const statuses = [response1.status, response2.status];
    
    // Exactly one should be 201 (Created) and exactly one should be 409 (Conflict/Full)
    const successCount = statuses.filter(s => s === 201).length;
    const failureCount = statuses.filter(s => s === 409).length;

    console.log(`Success Count: ${successCount} (Expected: 1)`);
    console.log(`Failure Count: ${failureCount} (Expected: 1)`);

    // Verify counts in DB
    const finalRsvpCount = await StudySessionRsvp.count({ where: { sessionId: limitSession.id } });
    console.log(`Final RSVPs in database: ${finalRsvpCount} (Expected: 1)`);

    if (successCount !== 1 || failureCount !== 1 || finalRsvpCount !== 1) {
      throw new Error('Concurrent RSVP validation failed: double-booking or transaction failure!');
    }
    console.log('Race condition protection works correctly!');

    // Clean up past session
    await StudySession.destroy({ where: { id: pastSession.id } });
    console.log('\nCleaned up created test study sessions.');

    console.log('\n--- All API Verification Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed with error:', error);
    process.exit(1);
  } finally {
    // Global test cleanup
    if (createdSessionId) {
      await StudySession.destroy({ where: { id: createdSessionId } });
    }
    if (testSessionId) {
      await StudySessionRsvp.destroy({ where: { sessionId: testSessionId } });
      await StudySession.destroy({ where: { id: testSessionId } });
    }
    if (student2Id) {
      await Enrollment.destroy({ where: { studentId: student2Id } });
      await User.destroy({ where: { id: student2Id } });
      console.log('Cleaned up dynamically created second student account.');
    }
  }
}

runTests();
