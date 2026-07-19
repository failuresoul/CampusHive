const { Course, User, CourseTeacher, Enrollment, LabReport, CourseMaterial } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/courses
 * Create a new academic course.
 */
const createCourse = async (req, res) => {
  try {
    const { code, title, department, creditHours, applicability, batchSemester, description } = req.body;

    const errors = {};

    // 1. Validate Code
    const cleanCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    const codePattern = /^[A-Z]{2,5}-\d{3,4}$/;
    if (!cleanCode) {
      errors.code = 'Course code is required.';
    } else if (!codePattern.test(cleanCode)) {
      errors.code = 'Invalid course code pattern. Must be like CSE-3106 or MAT-101.';
    }

    // 2. Validate Title
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    if (!cleanTitle) {
      errors.title = 'Course title is required.';
    }

    // 3. Validate Department
    const cleanDept = typeof department === 'string' ? department.trim() : '';
    if (!cleanDept) {
      errors.department = 'Department is required.';
    }

    // 4. Validate Credit Hours
    const credits = Number(creditHours);
    if (creditHours === undefined || creditHours === null || creditHours === '') {
      errors.creditHours = 'Credit hours is required.';
    } else if (isNaN(credits) || credits < 1 || credits > 5) {
      errors.creditHours = 'Credit hours must be a number between 1 and 5.';
    }

    // 5. Validate Applicability / batchSemester
    const finalBatchSemester = (applicability || batchSemester || '').toString().trim();
    if (!finalBatchSemester) {
      errors.applicability = 'Semester/Batch applicability is required.';
    }

    // Return 400 if any validation errors occurred
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // 6. Check for duplicate course code (case-insensitive in SQLite/MySQL, but normalize it)
    const existingCourse = await Course.findOne({
      where: {
        code: cleanCode,
      },
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: `Course with code '${cleanCode}' already exists.`,
      });
    }

    // 7. Persist course records
    const newCourse = await Course.create({
      code: cleanCode,
      title: cleanTitle,
      department: cleanDept,
      creditHours: credits,
      batchSemester: finalBatchSemester,
      description: typeof description === 'string' ? description.trim() : null,
    });

    // 8. Return response
    return res.status(201).json({
      success: true,
      data: {
        id: newCourse.id,
        code: newCourse.code,
        title: newCourse.title,
        department: newCourse.department,
        creditHours: newCourse.creditHours,
      },
    });
  } catch (error) {
    console.error('Error in createCourse controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating course.',
    });
  }
};

/**
 * GET /api/courses
 * List all academic courses, supporting optional query searches.
 */
const getCourses = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      const cleanSearch = search.trim();
      whereClause = {
        [Op.or]: [
          { code: { [Op.like]: `%${cleanSearch}%` } },
          { title: { [Op.like]: `%${cleanSearch}%` } },
          { department: { [Op.like]: `%${cleanSearch}%` } },
        ],
      };
    }

    const courses = await Course.findAll({
      where: whereClause,
      order: [['code', 'ASC']],
    });

    return res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error in getCourses controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching courses.',
    });
  }
};

/**
 * GET /api/courses/:courseId/teachers
 * List all teachers currently assigned to the specified course.
 */
const getCourseTeachers = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const teachers = await course.getTeachers({
      attributes: ['id', 'name', 'email', 'department', 'designation', 'phone'],
      joinTableAttributes: [], // Exclude join table details from nested list
    });

    return res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error('Error in getCourseTeachers controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching course teachers.',
    });
  }
};

/**
 * POST /api/courses/:courseId/teachers
 * Assign a teacher to a course (admin only).
 */
const assignTeacher = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required in request body.',
      });
    }

    // 1. Verify Course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // 2. Verify Teacher exists and is a teacher role
    const teacher = await User.findOne({
      where: {
        id: teacherId,
        role: 'teacher',
      },
    });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found or user is not a teacher.',
      });
    }

    // 3. Prevent duplicate assignment
    const existingAssignment = await CourseTeacher.findOne({
      where: {
        courseId,
        teacherId,
      },
    });
    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Teacher is already assigned to this course.',
      });
    }

    // 4. Create assignment
    await CourseTeacher.create({
      courseId,
      teacherId,
    });

    return res.status(201).json({
      success: true,
      message: 'Teacher assigned to course successfully.',
    });
  } catch (error) {
    console.error('Error in assignTeacher controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while assigning teacher.',
    });
  }
};

/**
 * DELETE /api/courses/:courseId/teachers/:teacherId
 * Remove a teacher from a course assignment (admin only).
 */
const removeTeacherAssignment = async (req, res) => {
  try {
    const { courseId, teacherId } = req.params;

    // Verify assignment exists
    const assignment = await CourseTeacher.findOne({
      where: {
        courseId,
        teacherId,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found. Teacher is not assigned to this course.',
      });
    }

    // Delete assignment
    await assignment.destroy();

    return res.json({
      success: true,
      message: 'Teacher removed from course assignment successfully.',
    });
  } catch (error) {
    console.error('Error in removeTeacherAssignment controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing teacher assignment.',
    });
  }
};

/**
 * GET /api/courses/:courseId/eligible-students
 * Returns students matching that department+batch who are not yet enrolled in this course,
 * plus a count of how many are already enrolled (for the UI's info display).
 */
const getEligibleStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Find course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const { department, batchSemester } = course;

    // 2. Find all students matching department and batch
    const students = await User.findAll({
      where: {
        role: 'student',
        department,
        batch: batchSemester,
        status: 'active',
      },
      attributes: ['id', 'name', 'email', 'rollNumber'],
    });

    // 3. Find already enrolled students for this course
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      attributes: ['studentId'],
    });

    const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));

    // 4. Map students with status (Eligible vs Already Enrolled)
    const mappedStudents = students.map((student) => {
      const isEnrolled = enrolledStudentIds.has(student.id);
      return {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        status: isEnrolled ? 'Already Enrolled' : 'Eligible',
      };
    });

    const alreadyEnrolledCount = enrolledStudentIds.size;

    return res.status(200).json({
      success: true,
      data: {
        students: mappedStudents,
        alreadyEnrolledCount,
      },
    });
  } catch (error) {
    console.error('Error in getEligibleStudents controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching eligible students.',
    });
  }
};

/**
 * POST /api/courses/:courseId/auto-enroll
 * Re-computes eligible students server-side and bulk-inserts enrollment rows in a transaction.
 */
const autoEnroll = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { courseId } = req.params;

    // 1. Find course
    const course = await Course.findByPk(courseId, { transaction: t });
    if (!course) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const { department, batchSemester } = course;

    // 2. Fetch all matching students
    const students = await User.findAll({
      where: {
        role: 'student',
        department,
        batch: batchSemester,
        status: 'active',
      },
      attributes: ['id'],
      transaction: t,
    });

    // 3. Fetch existing enrollments to find who is already enrolled
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      attributes: ['studentId'],
      transaction: t,
    });

    const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));

    // 4. Filter eligible students (not yet enrolled)
    const eligibleStudents = students.filter((student) => !enrolledStudentIds.has(student.id));

    const enrolledCount = eligibleStudents.length;
    const skippedCount = enrolledStudentIds.size;

    // 5. Bulk insert if there are any eligible students
    if (enrolledCount > 0) {
      const enrollmentRows = eligibleStudents.map((student) => ({
        studentId: student.id,
        courseId,
        enrolledAt: new Date(),
      }));

      await Enrollment.bulkCreate(enrollmentRows, {
        transaction: t,
        ignoreDuplicates: true, // Safety guard against race conditions
      });
    }

    await t.commit();

    return res.status(200).json({
      success: true,
      data: {
        enrolledCount,
        skippedCount,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in autoEnroll controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during auto-enrollment.',
    });
  }
};

/**
 * POST /api/courses/:courseId/lab-reports
 * Upload a lab report for a course (student only).
 */
const uploadLabReport = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const { title, description } = req.body;

    // 1. Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { courseId, studentId }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not enrolled in this course.',
      });
    }

    // 2. Validate file existence
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or invalid file format.',
      });
    }

    const { originalname, size, path: filePath } = req.file;

    // 3. Create LabReport record
    const labReport = await LabReport.create({
      studentId,
      courseId,
      title: title || null,
      description: description || null,
      filePath,
      originalFileName: originalname,
      fileSize: size,
      status: 'submitted',
    });

    return res.status(201).json({
      success: true,
      data: {
        id: labReport.id,
        fileName: labReport.originalFileName,
        submittedAt: labReport.submittedAt,
      }
    });

  } catch (error) {
    console.error('Error in uploadLabReport controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while uploading lab report.',
    });
  }
};

/**
 * GET /api/courses/:courseId/lab-reports/mine
 * Get all lab reports submitted by the logged-in student for a course.
 */
const getMyLabReports = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // 1. Verify enrollment
    const enrollment = await Enrollment.findOne({
      where: { courseId, studentId }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not enrolled in this course.',
      });
    }

    // 2. Fetch lab reports for this student & course
    const labReports = await LabReport.findAll({
      where: {
        courseId,
        studentId,
      },
      order: [['submittedAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: labReports,
    });
  } catch (error) {
    console.error('Error in getMyLabReports controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching lab reports.',
    });
  }
};

/**
 * GET /api/courses/:courseId/lab-reports/:reportId/download
 * Download a specific lab report securely.
 */
const downloadLabReport = async (req, res) => {
  try {
    const { courseId, reportId } = req.params;
    const studentId = req.user.id;

    // 1. Verify enrollment
    const enrollment = await Enrollment.findOne({
      where: { courseId, studentId }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not enrolled in this course.',
      });
    }

    // 2. Fetch the lab report
    const labReport = await LabReport.findOne({
      where: {
        id: reportId,
        courseId,
        studentId, // Ensure they only download their own reports
      }
    });

    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found.',
      });
    }

    // 3. Send file
    const absolutePath = path.resolve(labReport.filePath);
    
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server.',
      });
    }

    res.download(absolutePath, labReport.originalFileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        // Only send response if headers have not been sent yet
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file.',
          });
        }
      }
    });

  } catch (error) {
    console.error('Error in downloadLabReport controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while downloading file.',
    });
  }
};

/**
 * GET /api/courses/:courseId/lab-reports/:reportId
 * Get details of a specific lab report for a student.
 */
const getLabReportDetail = async (req, res) => {
  try {
    const { courseId, reportId } = req.params;
    const studentId = req.user.id;

    const labReport = await LabReport.findOne({
      where: {
        id: reportId,
        courseId,
        studentId, // Ensures a student can only view their own submission
      }
    });

    if (!labReport) {
      return res.status(404).json({
        success: false,
        message: 'Lab report not found or you do not have permission to view it.',
      });
    }

    return res.status(200).json({
      success: true,
      data: labReport,
    });
  } catch (error) {
    console.error('Error in getLabReportDetail controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching lab report details.',
    });
  }
};

/**
 * POST /api/courses/:courseId/materials
 * Upload multiple course learning materials (teacher only).
 * Performs validation per file and outputs a partial success report.
 */
const uploadMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    // 1. Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      // Clean up uploaded files if course does not exist
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // 2. Verify teacher is assigned to this course
    const assignment = await CourseTeacher.findOne({
      where: {
        courseId,
        teacherId,
      },
    });

    if (!assignment) {
      // Clean up uploaded files if teacher not assigned
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not assigned to this course.',
      });
    }

    // 3. Check file presence
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded.',
      });
    }

    const uploadedList = [];
    const failedList = [];

    // Parse parallel arrays or strings from body
    const titles = Array.isArray(req.body.title) 
      ? req.body.title 
      : (req.body.title ? [req.body.title] : []);

    const categories = Array.isArray(req.body.category) 
      ? req.body.category 
      : (req.body.category ? [req.body.category] : []);

    const descriptions = Array.isArray(req.body.description) 
      ? req.body.description 
      : (req.body.description ? [req.body.description] : []);

    // 4. Validate and save each file independently
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const originalName = file.originalname;
      const ext = path.extname(originalName).toLowerCase();
      
      const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];
      const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-zip-compressed'
      ];
      const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

      const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);
      const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);

      // Check format validity
      if (!isValidExtension && !isValidMime) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        failedList.push({
          fileName: originalName,
          reason: 'Unsupported file format. Only PDF, DOC/DOCX, PPT/PPTX, and ZIP are allowed.',
        });
        continue;
      }

      // Check size limit
      if (file.size > MAX_SIZE_BYTES) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        failedList.push({
          fileName: originalName,
          reason: 'File exceeds the maximum size limit of 25MB.',
        });
        continue;
      }

      // Resolve metadata corresponding to file index
      const title = (titles[i] && titles[i].trim()) || originalName;
      const category = (categories[i] && categories[i].trim()) || 'Lecture Notes';
      const description = (descriptions[i] && descriptions[i].trim()) || null;

      try {
        const material = await CourseMaterial.create({
          courseId,
          teacherId,
          title,
          category,
          description,
          filePath: file.path,
          originalFileName: originalName,
          fileSize: file.size,
          fileType: file.mimetype,
          downloadCount: 0,
        });

        uploadedList.push({
          id: material.id,
          fileName: originalName,
          title: material.title,
          category: material.category,
        });
      } catch (err) {
        console.error(`Error saving course material record for ${originalName}:`, err);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        failedList.push({
          fileName: originalName,
          reason: 'Database insertion failure.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        uploaded: uploadedList,
        failed: failedList,
      },
    });

  } catch (error) {
    console.error('Error in uploadMaterials controller:', error);
    // Cleanup any successfully uploaded files in the request if controller itself errored out
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error while uploading course materials.',
    });
  }
};

/**
 * GET /api/courses/:courseId/materials
 * Retrieve all learning materials for a specific course.
 * Protected by auth + teacher role verification and course assignment.
 */
const getMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;
    const { category, search } = req.query;

    // 1. Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // 2. Verify logged-in teacher is assigned to the course
    const assignment = await CourseTeacher.findOne({
      where: { courseId, teacherId },
    });
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not assigned to this course.',
      });
    }

    // 3. Build query filters
    const whereClause = { courseId };

    if (category && category.trim() !== '') {
      whereClause.category = category.trim();
    }

    if (search && search.trim() !== '') {
      whereClause.title = {
        [Op.like]: `%${search.trim()}%`,
      };
    }

    // 4. Fetch materials
    const materials = await CourseMaterial.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['uploadedAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Error in getMaterials controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching course materials.',
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseTeachers,
  assignTeacher,
  removeTeacherAssignment,
  getEligibleStudents,
  autoEnroll,
  uploadLabReport,
  getMyLabReports,
  downloadLabReport,
  getLabReportDetail,
  uploadMaterials,
  getMaterials,
};
