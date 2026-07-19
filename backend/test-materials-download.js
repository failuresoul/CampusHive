const sequelize = require('./config/database');
const { Course, User, Enrollment, CourseTeacher, CourseMaterial } = require('./models/associations');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkey_replace_me_in_production',
    { expiresIn: '1h' }
  );
}

async function runDownloadTests() {
  console.log('--- Starting Course Materials Download API Verification Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  let testCourse = null;
  let testTeacher = null;
  let testStudentEnrolled = null;
  let testStudentNotEnrolled = null;
  let testMaterial = null;

  let teacherToken = null;
  let enrolledStudentToken = null;
  let notEnrolledStudentToken = null;
  
  const testFilePath = 'backend/uploads/test_material_download.txt';

  try {
    await sequelize.sync();

    // 1. Setup test entities
    console.log('Setting up database test entities...');
    
    [testTeacher] = await User.findOrCreate({
      where: { email: 'download-teacher@campushive.edu' },
      defaults: {
        name: 'Download Teacher',
        passwordHash: 'dummyhash',
        role: 'teacher',
      }
    });

    [testStudentEnrolled] = await User.findOrCreate({
      where: { email: 'enrolled-student@campushive.com' },
      defaults: {
        name: 'Enrolled Student',
        passwordHash: 'dummyhash',
        role: 'student',
        rollNumber: 'EN-001',
      }
    });

    [testStudentNotEnrolled] = await User.findOrCreate({
      where: { email: 'notenrolled-student@campushive.com' },
      defaults: {
        name: 'Not Enrolled Student',
        passwordHash: 'dummyhash',
        role: 'student',
        rollNumber: 'EN-002',
      }
    });

    [testCourse] = await Course.findOrCreate({
      where: { code: 'TEST-3333' },
      defaults: {
        title: 'Download Integration Course',
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

    // Remove any existing test materials
    await CourseMaterial.destroy({ where: { courseId: testCourse.id } });

    // Create a dummy physical file in backend/uploads
    if (!fs.existsSync('backend/uploads')) {
      fs.mkdirSync('backend/uploads', { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'This is a test download file contents.');

    // Save Material in DB (using path relative to the server working directory)
    testMaterial = await CourseMaterial.create({
      courseId: testCourse.id,
      teacherId: testTeacher.id,
      title: 'SRS Template Document',
      category: 'Assignment',
      filePath: 'uploads/test_material_download.txt',
      originalFileName: 'srs_template_original.txt',
      fileSize: 37,
      fileType: 'txt',
      downloadCount: 0,
    });

    teacherToken = generateToken(testTeacher);
    enrolledStudentToken = generateToken(testStudentEnrolled);
    notEnrolledStudentToken = generateToken(testStudentNotEnrolled);

    console.log(`Test material setup done. ID: ${testMaterial.id}`);

    // --- TEST 1: Enrolled student fetches course materials list (Expected: 200 OK) ---
    console.log('\nTest 1: Enrolled student fetching materials list...');
    const resListEnrolled = await fetch(`${baseUrl}/courses/${testCourse.id}/materials`, {
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resListEnrolled.status, '(Expected: 200)');
    const listEnrolledData = await resListEnrolled.json();
    console.log('Success:', listEnrolledData.success);
    if (resListEnrolled.status !== 200 || !listEnrolledData.success) {
      throw new Error('Enrolled student failed to fetch materials list');
    }

    // --- TEST 2: Non-enrolled student fetches course materials list (Expected: 403 Forbidden) ---
    console.log('\nTest 2: Non-enrolled student fetching materials list...');
    const resListNotEnrolled = await fetch(`${baseUrl}/courses/${testCourse.id}/materials`, {
      headers: { 'Authorization': `Bearer ${notEnrolledStudentToken}` }
    });
    console.log('Status:', resListNotEnrolled.status, '(Expected: 403)');
    if (resListNotEnrolled.status !== 403) {
      throw new Error('Allowed non-enrolled student to fetch materials list');
    }

    // --- TEST 3: Enrolled student downloads file (Expected: 200 OK, correct filename headers) ---
    console.log('\nTest 3: Enrolled student downloading material file...');
    const resDownloadEnrolled = await fetch(`${baseUrl}/materials/${testMaterial.id}/download`, {
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resDownloadEnrolled.status, '(Expected: 200)');
    
    // Check filename headers
    const contentDisposition = resDownloadEnrolled.headers.get('content-disposition');
    console.log('Content-Disposition Header:', contentDisposition);
    const hasOriginalName = contentDisposition && contentDisposition.includes('srs_template_original.txt');
    console.log('Has correct original name header:', hasOriginalName, '(Expected: true)');
    
    const fileBody = await resDownloadEnrolled.text();
    console.log('Downloaded File Body:', fileBody);

    if (resDownloadEnrolled.status !== 200 || !hasOriginalName || fileBody !== 'This is a test download file contents.') {
      throw new Error('Download failed or served incorrect filename/body');
    }

    // --- TEST 4: Teacher assigned to the course downloads file (Expected: 200 OK) ---
    console.log('\nTest 4: Assigned teacher downloading material file...');
    const resDownloadTeacher = await fetch(`${baseUrl}/materials/${testMaterial.id}/download`, {
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    console.log('Status:', resDownloadTeacher.status, '(Expected: 200)');
    if (resDownloadTeacher.status !== 200) {
      throw new Error('Assigned teacher download failed');
    }

    // --- TEST 5: Student NOT enrolled in the course downloads file (Expected: 403 Forbidden) ---
    console.log('\nTest 5: Student not enrolled trying to download material file...');
    const resDownloadNotEnrolled = await fetch(`${baseUrl}/materials/${testMaterial.id}/download`, {
      headers: { 'Authorization': `Bearer ${notEnrolledStudentToken}` }
    });
    console.log('Status:', resDownloadNotEnrolled.status, '(Expected: 403)');
    if (resDownloadNotEnrolled.status !== 403) {
      throw new Error('Allowed non-enrolled student to download files');
    }

    // --- TEST 6: Requesting a non-existent material (Expected: 404 Not Found) ---
    console.log('\nTest 6: Requesting a non-existent material ID...');
    const resDownloadNonExistent = await fetch(`${baseUrl}/materials/99999/download`, {
      headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
    });
    console.log('Status:', resDownloadNonExistent.status, '(Expected: 404)');
    if (resDownloadNonExistent.status !== 404) {
      throw new Error('Non-existent material did not return 404');
    }

    // --- TEST 7: Atomic download count increment check (Expected: concurrent requests correctly increment count) ---
    console.log('\nTest 7: Concurrent downloads checking for atomic count increments...');
    
    // Check initial count
    const materialBefore = await CourseMaterial.findByPk(testMaterial.id);
    console.log('Initial downloadCount:', materialBefore.downloadCount);

    // Concurrently trigger 5 downloads
    console.log('Firing 5 concurrent download requests...');
    const downloadPromises = Array.from({ length: 5 }).map(() =>
      fetch(`${baseUrl}/materials/${testMaterial.id}/download`, {
        headers: { 'Authorization': `Bearer ${enrolledStudentToken}` }
      })
    );
    await Promise.all(downloadPromises);

    // Check count after
    const materialAfter = await CourseMaterial.findByPk(testMaterial.id);
    console.log('Final downloadCount:', materialAfter.downloadCount);
    
    const difference = materialAfter.downloadCount - materialBefore.downloadCount;
    console.log(`Incremented count difference: ${difference} (Expected: 5)`);
    if (difference !== 5) {
      throw new Error(`Count increment was not atomic. Increment difference: ${difference}, expected 5.`);
    }

    console.log('\n--- All Course Materials Download API Tests Passed Successfully! ---');
  } catch (error) {
    console.error('Test run failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    console.log('Cleaning up test data...');
    if (fs.existsSync(testFilePath)) {
      try { fs.unlinkSync(testFilePath); } catch (e) {}
    }
    if (testCourse) {
      await CourseMaterial.destroy({ where: { courseId: testCourse.id } });
      await CourseTeacher.destroy({ where: { courseId: testCourse.id } });
      await Enrollment.destroy({ where: { courseId: testCourse.id } });
      await Course.destroy({ where: { id: testCourse.id } });
    }
  }
}

runDownloadTests();
