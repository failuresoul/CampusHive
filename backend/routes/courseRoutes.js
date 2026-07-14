const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const studentId = req.user ? req.user.id : 'unknown';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, studentId + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// GET /api/courses
// List all courses (authenticated users)
router.get(
  '/',
  authMiddleware,
  courseController.getCourses
);

// POST /api/courses
// Create a new course (admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.createCourse
);

// GET /api/courses/:courseId/teachers
// List teachers assigned to a course (authenticated users)
router.get(
  '/:courseId/teachers',
  authMiddleware,
  courseController.getCourseTeachers
);

// POST /api/courses/:courseId/teachers
// Assign a teacher to a course (admin only)
router.post(
  '/:courseId/teachers',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.assignTeacher
);

// DELETE /api/courses/:courseId/teachers/:teacherId
// Remove a teacher assignment (admin only)
router.delete(
  '/:courseId/teachers/:teacherId',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.removeTeacherAssignment
);

// GET /api/courses/:courseId/eligible-students
// Get eligible students for a course (admin only)
router.get(
  '/:courseId/eligible-students',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.getEligibleStudents
);

// POST /api/courses/:courseId/auto-enroll
// Auto enroll eligible students for a course (admin only)
router.post(
  '/:courseId/auto-enroll',
  authMiddleware,
  roleMiddleware(['admin']),
  courseController.autoEnroll
);

// POST /api/courses/:courseId/lab-reports
// Upload a lab report (student only)
router.post(
  '/:courseId/lab-reports',
  authMiddleware,
  roleMiddleware(['student']),
  (req, res, next) => {
    const uploadSingle = upload.single('file');
    uploadSingle(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      next();
    });
  },
  courseController.uploadLabReport
);

// GET /api/courses/:courseId/lab-reports/mine
// Get logged-in student's lab reports for a course
router.get(
  '/:courseId/lab-reports/mine',
  authMiddleware,
  roleMiddleware(['student']),
  courseController.getMyLabReports
);

// GET /api/courses/:courseId/lab-reports/:reportId/download
// Securely download a specific lab report
router.get(
  '/:courseId/lab-reports/:reportId/download',
  authMiddleware,
  roleMiddleware(['student']),
  courseController.downloadLabReport
);

// GET /api/courses/:courseId/lab-reports/:reportId
// Get details of a specific lab report
router.get(
  '/:courseId/lab-reports/:reportId',
  authMiddleware,
  roleMiddleware(['student']),
  courseController.getLabReportDetail
);

module.exports = router;
