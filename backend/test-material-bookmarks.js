const sequelize = require('./config/database');
const { Course, User, Enrollment, CourseTeacher, CourseMaterial, MaterialBookmark } = require('./models/associations');
const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
    { expiresIn: '1h' }
  );
}

async function runBookmarkTests() {
  console.log('--- Starting Course Materials Bookmark API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  let testCourse = null;
  let testTeacher = null;
  let testStudentEnrolled = null;
  let testStudentNotEnrolled = null;
  let testMaterial = null;

  let enrolledStudentToken = null;
  let notEnrolledStudentToken = null;

  try {
    await sequelize.sync();

    // Setup database test entities
    console.log('Setting up database test entities...');

    [testTeacher] = await User.findOrCreate({
      where: { email: 'bookmark-teacher@campushive.edu' },
      defaults: {
        name: 'Bookmark Teacher',
        passwordHash: 'dummyhash',
        role: 'teacher',
      }
    });

    [testStudentEnrolled] = await User.findOrCreate({
      where: { email: 'enrolled-bookmark-student@campushive.com' },
      defaults: {
        name: 'Enrolled Student',
        passwordHash: 'dummyhash',
        role: 'student',
        rollNumber: 'BK-001',
      }
    });

    [testStudentNotEnrolled] = await User.findOrCreate({
      where: { email: 'notenrolled-bookmark-student@campushive.com' },
      defaults: {
        name: 'Not Enrolled Student',
        passwordHash: 'dummyhash',
        role: 'student',
        rollNumber: 'BK-002',
      }
    });

    [testCourse] = await Course.findOrCreate({
      where: { code: 'BKST-7777' },
      defaults: {
        title: 'Bookmark Integration Course',
        department: 'CSE',
        creditHours: 3,
        applicability: 'core',
        batchSemester: '3-1',
      }
    });

    // Setup relationships
    await CourseTeacher.findOrCreate({
      where: { courseId: testCourse.id, teacherId: testTeacher.id }
    });

    await Enrollment.findOrCreate({
      where: { courseId: testCourse.id, studentId: testStudentEnrolled.id }
    });

    // Remove any existing test materials and bookmarks
    await CourseMaterial.destroy({ where: { courseId: testCourse.id } });
    await MaterialBookmark.destroy({ where: { studentId: testStudentEnrolled.id } });

    // Save Material in DB
    testMaterial = await CourseMaterial.create({
      courseId: testCourse.id,
      teacherId: testTeacher.id,
      title: 'Scrum Agile Guide Notes',
      category: 'Lecture Notes',
      filePath: 'uploads/scrum_notes.pdf',
      originalFileName: 'scrum_notes.pdf',
      fileSize: 10240,
      fileType: 'pdf',
      downloadCount: 0,
    });

    enrolledStudentToken = generateToken(testStudentEnrolled);
    notEnrolledStudentToken = generateToken(testStudentNotEnrolled);

    console.log(`Test material setup done. ID: ${testMaterial.id}`);

    // --- TEST 1: Enrolled student bookmarks material (Expected: 200 OK) ---
    console.log('\nTest 1: Enrolled student bookmarking material...');
    const resBookmark = await fetch(`${baseUrl}/materials/${testMaterial.id}/bookmark`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resBookmark.status, '(Expected: 200)');
    const bookmarkData = await resBookmark.json();
    console.log('Body:', bookmarkData);
    if (resBookmark.status !== 200 || !bookmarkData.success) {
      throw new Error('Enrolled student failed to bookmark material');
    }

    // Verify it is created in the database
    const dbBookmark = await MaterialBookmark.findOne({
      where: { studentId: testStudentEnrolled.id, materialId: testMaterial.id }
    });
    console.log('Bookmark created in database:', !!dbBookmark, '(Expected: true)');
    if (!dbBookmark) throw new Error('Bookmark was not saved to database');

    // --- TEST 2: Bookmark Idempotence - Re-bookmarking same material (Expected: 200 OK, no error, no duplicates) ---
    console.log('\nTest 2: Double bookmarking same material (idempotency check)...');
    const resBookmarkDup = await fetch(`${baseUrl}/materials/${testMaterial.id}/bookmark`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resBookmarkDup.status, '(Expected: 200)');
    if (resBookmarkDup.status !== 200) {
      throw new Error('Repeated bookmark call threw an error');
    }

    const bookmarkCount = await MaterialBookmark.count({
      where: { studentId: testStudentEnrolled.id, materialId: testMaterial.id }
    });
    console.log('Total database bookmark rows for this user+material:', bookmarkCount, '(Expected: 1)');
    if (bookmarkCount !== 1) {
      throw new Error('Idempotent check failed: created duplicate rows!');
    }

    // --- TEST 3: Student NOT enrolled in the course tries to bookmark (Expected: 403 Forbidden) ---
    console.log('\nTest 3: Non-enrolled student trying to bookmark material...');
    const resBookmarkNotEnrolled = await fetch(`${baseUrl}/materials/${testMaterial.id}/bookmark`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${notEnrolledStudentToken}` }
    });
    console.log('Status:', resBookmarkNotEnrolled.status, '(Expected: 403)');
    if (resBookmarkNotEnrolled.status !== 403) {
      throw new Error('Allowed non-enrolled student to bookmark material');
    }

    // --- TEST 4: Fetch bookmarked materials list (Expected: 200 OK, contains material, teacher, and course details) ---
    console.log('\nTest 4: Retrieving bookmarks list...');
    const resGetBookmarks = await fetch(`${baseUrl}/students/me/bookmarks`, {
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resGetBookmarks.status, '(Expected: 200)');
    const getBookmarksData = await resGetBookmarks.json();
    console.log('Success:', getBookmarksData.success);
    console.log('Bookmarks Count:', getBookmarksData.data?.length, '(Expected: 1)');
    if (resGetBookmarks.status !== 200 || getBookmarksData.data?.length !== 1) {
      throw new Error('Bookmarks retrieval list is empty or failed');
    }

    const firstBookmark = getBookmarksData.data[0];
    console.log('Retrieved Material Title:', firstBookmark.title);
    console.log('Retrieved Material isBookmarked:', firstBookmark.isBookmarked, '(Expected: true)');
    console.log('Retrieved Teacher Name:', firstBookmark.teacher?.name, '(Expected: Bookmark Teacher)');
    console.log('Retrieved Course Code:', firstBookmark.course?.code, '(Expected: BKST-7777)');

    if (
      firstBookmark.title !== 'Scrum Agile Guide Notes' ||
      !firstBookmark.isBookmarked ||
      firstBookmark.teacher?.name !== 'Bookmark Teacher' ||
      firstBookmark.course?.code !== 'BKST-7777'
    ) {
      throw new Error('Bookmark item details missing or incorrect');
    }

    // --- TEST 5: Unbookmark material (Expected: 200 OK) ---
    console.log('\nTest 5: Student unbookmarking material...');
    const resUnbookmark = await fetch(`${baseUrl}/materials/${testMaterial.id}/bookmark`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resUnbookmark.status, '(Expected: 200)');
    const unbookmarkData = await resUnbookmark.json();
    console.log('Body:', unbookmarkData);
    if (resUnbookmark.status !== 200 || !unbookmarkData.success) {
      throw new Error('Failed to unbookmark material');
    }

    // Verify it is removed from the database
    const dbBookmarkAfter = await MaterialBookmark.findOne({
      where: { studentId: testStudentEnrolled.id, materialId: testMaterial.id }
    });
    console.log('Bookmark in database after unbookmark:', !!dbBookmarkAfter, '(Expected: false)');
    if (dbBookmarkAfter) throw new Error('Bookmark was not deleted from database');

    // --- TEST 6: Unbookmark Idempotence - Unbookmarking again (Expected: 200 OK, no-op) ---
    console.log('\nTest 6: Repeated unbookmarking (idempotency check)...');
    const resUnbookmarkDup = await fetch(`${baseUrl}/materials/${testMaterial.id}/bookmark`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resUnbookmarkDup.status, '(Expected: 200)');
    if (resUnbookmarkDup.status !== 200) {
      throw new Error('Repeated unbookmark call threw an error');
    }

    console.log('\n--- All Course Materials Bookmark API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    if (testCourse) {
      await CourseMaterial.destroy({ where: { courseId: testCourse.id } });
      await CourseTeacher.destroy({ where: { courseId: testCourse.id } });
      await Enrollment.destroy({ where: { courseId: testCourse.id } });
      await Course.destroy({ where: { id: testCourse.id } });
    }
  }
}

runBookmarkTests();
