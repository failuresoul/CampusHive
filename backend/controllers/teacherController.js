const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');
const { LabReport, Course, CourseTeacher } = require('../models/associations');

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_PAGE_SIZE = 100;
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const ALLOWED_TEACHER_SORT_FIELDS = {
  name:       'name',
  department: 'department',
  designation: 'designation',
};

// ── Allowed values (whitelist) ─────────────────────────────────────────────────

const ALLOWED_DEPARTMENTS  = ['CSE', 'EEE', 'ME', 'CE', 'BBA', 'ENG'];
const ALLOWED_DESIGNATIONS = [
  'Lecturer',
  'Assistant Professor',
  'Associate Professor',
  'Professor',
];

// Accepts formats: +8801XXXXXXXXX, 01XXXXXXXXX, or international +XX…
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/teachers
 *
 * Creates a new teacher account in the Users table.
 * Protected by authMiddleware + roleMiddleware(['admin']).
 *
 * Request body:
 *   name        {string}  – required
 *   email       {string}  – required, unique, used as login
 *   department  {string}  – required, one of ALLOWED_DEPARTMENTS
 *   designation {string}  – required, one of ALLOWED_DESIGNATIONS
 *   phone       {string}  – optional
 *   password    {string}  – required, min 8 chars; bcrypt-hashed before storage
 *
 * Responses:
 *   201 – { success: true, data: { id, name, email, department, designation, createdAt } }
 *   400 – { success: false, message, errors: { field: msg } }
 *   409 – { success: false, message }
 *   500 – { success: false, message }
 *
 * Security note: passwordHash is NEVER returned in any response.
 */
const registerTeacher = async (req, res) => {
  try {
    const {
      name        = '',
      email       = '',
      department  = '',
      designation = '',
      phone       = '',
      password    = '',
    } = req.body;

    // ── Server-side validation ──────────────────────────────────────────────

    const errors = {};

    // name
    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    // email
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    // department
    if (!department) {
      errors.department = 'Department is required.';
    } else if (!ALLOWED_DEPARTMENTS.includes(department)) {
      errors.department = `Invalid department. Allowed: ${ALLOWED_DEPARTMENTS.join(', ')}.`;
    }

    // designation
    if (!designation) {
      errors.designation = 'Designation is required.';
    } else if (!ALLOWED_DESIGNATIONS.includes(designation)) {
      errors.designation = `Invalid designation. Allowed: ${ALLOWED_DESIGNATIONS.join(', ')}.`;
    }

    // phone (optional — only validated when provided)
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');
    if (normalizedPhone && !PHONE_REGEX.test(normalizedPhone)) {
      errors.phone = 'Please enter a valid phone number (7–15 digits).';
    }

    // password
    if (!password) {
      errors.password = 'A temporary password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed. Please correct the highlighted fields.',
        errors,
      });
    }

    // ── Duplicate email check ───────────────────────────────────────────────

    const existing = await User.findOne({
      where: { email: normalizedEmail },
      attributes: ['id'],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
        errors: { email: 'A user with this email already exists.' },
      });
    }

    // ── Hash password (cost 12) ─────────────────────────────────────────────

    const passwordHash = await bcrypt.hash(password, 12);

    // ── Create user record ──────────────────────────────────────────────────

    const teacher = await User.create({
      name:               name.trim(),
      email:              normalizedEmail,
      passwordHash,
      role:               'teacher',
      department,
      designation,
      phone:              normalizedPhone || null,
      status:             'active',
      mustChangePassword: true,   // teacher must reset on first login (future story)
    });

    // ── Return safe payload (never expose passwordHash) ─────────────────────

    return res.status(201).json({
      success: true,
      data: {
        id:          teacher.id,
        name:        teacher.name,
        email:       teacher.email,
        department:  teacher.department,
        designation: teacher.designation,
        createdAt:   teacher.createdAt,
      },
    });

  } catch (error) {
    console.error('registerTeacher error:', error);

    // Sequelize unique constraint — belt-and-suspenders in case the findOne
    // check above loses a race with a concurrent request.
    if (
      error.name === 'SequelizeUniqueConstraintError' ||
      (error.original && error.original.code === 'SQLITE_CONSTRAINT')
    ) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
        errors: { email: 'A user with this email already exists.' },
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to register teacher. Please try again.',
    });
  }
};

/**
 * GET /api/teachers
 *
 * Returns a paginated, searchable, filterable list of teacher accounts.
 * Protected by authMiddleware + roleMiddleware(['admin']).
 *
 * Query params:
 *   search     – partial match on name / email (case-insensitive)
 *   department – exact match
 *   page       – 1-indexed, default 1
 *   pageSize   – default 25, max 100
 *
 * Response:
 *   { success, data: { teachers, pagination: { page, pageSize, totalItems, totalPages } } }
 */
const getTeachers = async (req, res) => {
  try {
    const {
      search     = '',
      department = '',
      page       = '1',
      pageSize   = '25',
      sortBy     = 'name',
      sortOrder  = 'asc',
    } = req.query;

    // ── Sanitise & validate ──────────────────────────────────────────────────

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));
    const offset  = (pageNum - 1) * pageSz;

    const safeSort  = ALLOWED_TEACHER_SORT_FIELDS[sortBy] || 'name';
    const safeOrder = ALLOWED_SORT_ORDERS.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : 'asc';

    // ── Build WHERE clause ───────────────────────────────────────────────────

    const where = { role: 'teacher' };

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name:  { [Op.like]: q } },
        { email: { [Op.like]: q } },
      ];
    }

    if (department) where.department = department;

    // ── Query DB ─────────────────────────────────────────────────────────────

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'email',
        'department', 'designation', 'phone', 'status',
        'createdAt',
      ],
      order:  [[safeSort, safeOrder.toUpperCase()]],
      limit:  pageSz,
      offset,
    });

    // ── Shape response ───────────────────────────────────────────────────────

    return res.status(200).json({
      success: true,
      data: {
        teachers: rows,
        pagination: {
          page:       pageNum,
          pageSize:   pageSz,
          totalItems: count,
          totalPages: Math.max(1, Math.ceil(count / pageSz)),
        },
      },
    });
  } catch (error) {
    console.error('getTeachers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers.',
    });
  }
};

/**
 * GET /api/teachers/me/submissions
 *
 * Returns a paginated list of lab report submissions scoped to only the
 * courses the logged-in teacher is assigned to (via CourseTeacher).
 *
 * Query params:
 *   status   – 'submitted' (default) | 'graded' | 'all'
 *   courseId – UUID; narrows to one specific course
 *   page     – 1-indexed, default 1
 *   pageSize – default 25, max 100
 *
 * Response shape per item:
 *   id, studentName, courseCode, courseTitle, courseId,
 *   title, submittedAt, status, grade, feedback, filePath
 *
 * Protected by authMiddleware + roleMiddleware(['teacher']).
 */
const getTeacherSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const {
      status   = 'submitted',
      courseId = '',
      page     = '1',
      pageSize = '25',
    } = req.query;

    // ── Sanitise & validate ──────────────────────────────────────────────────

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));
    const offset  = (pageNum - 1) * pageSz;

    const ALLOWED_STATUSES = ['submitted', 'graded', 'all'];
    const safeStatus = ALLOWED_STATUSES.includes(status) ? status : 'submitted';

    // ── Step 1: Resolve teacher's assigned course IDs ────────────────────────

    const assignments = await CourseTeacher.findAll({
      where: { teacherId },
      attributes: ['courseId'],
    });

    const assignedCourseIds = assignments.map((a) => a.courseId);

    if (assignedCourseIds.length === 0) {
      // Teacher has no assigned courses → return empty result
      return res.status(200).json({
        success: true,
        data: {
          submissions: [],
          pagination: { page: pageNum, pageSize: pageSz, totalItems: 0, totalPages: 1 },
          courses: [],
        },
      });
    }

    // ── Step 2: Build WHERE clause ────────────────────────────────────────────

    const where = {
      courseId: { [Op.in]: assignedCourseIds },
    };

    // Optional: narrow to a single course (must belong to this teacher)
    if (courseId && assignedCourseIds.includes(courseId)) {
      where.courseId = courseId;
    }

    // Status filter
    if (safeStatus !== 'all') {
      where.status = safeStatus;
    }

    // ── Step 3: Default sort — oldest first for ungraded, newest first for graded/all ──

    const order = safeStatus === 'submitted'
      ? [['submittedAt', 'ASC']]   // clear the backlog oldest-first
      : [['submittedAt', 'DESC']];

    // ── Step 4: Query ────────────────────────────────────────────────────────

    const { count, rows } = await LabReport.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'rollNumber'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'title'],
        },
      ],
      order,
      limit: pageSz,
      offset,
      // distinct is required when using include + findAndCountAll to avoid
      // inflated counts caused by the JOIN
      distinct: true,
    });

    // ── Step 5: Fetch teacher's course list (for filter dropdown) ─────────────

    const teacherCourses = await Course.findAll({
      where: { id: { [Op.in]: assignedCourseIds } },
      attributes: ['id', 'code', 'title'],
      order: [['code', 'ASC']],
    });

    // ── Step 6: Shape response ────────────────────────────────────────────────

    const submissions = rows.map((lr) => ({
      id:          lr.id,
      studentName: lr.student?.name    ?? 'Unknown',
      rollNumber:  lr.student?.rollNumber ?? '—',
      studentId:   lr.studentId,
      courseId:    lr.courseId,
      courseCode:  lr.course?.code     ?? '—',
      courseTitle: lr.course?.title    ?? '—',
      title:       lr.title,
      description: lr.description,
      submittedAt: lr.submittedAt,
      status:      lr.status,
      grade:       lr.grade,
      feedback:    lr.feedback,
      filePath:    lr.filePath,
      originalFileName: lr.originalFileName,
      fileSize:    lr.fileSize,
    }));

    return res.status(200).json({
      success: true,
      data: {
        submissions,
        pagination: {
          page:       pageNum,
          pageSize:   pageSz,
          totalItems: count,
          totalPages: Math.max(1, Math.ceil(count / pageSz)),
        },
        courses: teacherCourses,
      },
    });
  } catch (error) {
    console.error('getTeacherSubmissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions.',
    });
  }
};
/**
 * POST /api/lab-reports/:submissionId/grade
 *
 * Grades a lab report submission.
 * Validates range (0-100).
 * Verifies the teacher is assigned to the course.
 */
const gradeSubmission = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;
    const { grade, feedback = '' } = req.body;

    const numGrade = Number(grade);
    if (grade === undefined || grade === null || isNaN(numGrade) || numGrade < 0 || numGrade > 100) {
      return res.status(400).json({ success: false, message: 'Valid grade between 0 and 100 is required.' });
    }

    const labReport = await LabReport.findByPk(submissionId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!labReport) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const isAssigned = await CourseTeacher.findOne({
      where: {
        teacherId,
        courseId: labReport.courseId,
      }
    });

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade submissions for this course.' });
    }

    const wasAlreadyGraded = labReport.status === 'graded';

    labReport.grade = numGrade.toString();
    labReport.feedback = feedback;
    labReport.status = 'graded';
    await labReport.save();

    const notifyStudentOfGrade = require('../utils/notifyStudentOfGrade');
    const notification = await notifyStudentOfGrade(labReport.id);
    
    if (wasAlreadyGraded && notification) {
      notification.message = notification.message.replace('has been graded', 'grade has been updated');
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        submissionId: labReport.id,
        grade: labReport.grade,
        status: labReport.status,
      }
    });
  } catch (error) {
    console.error('gradeSubmission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save grade.' });
  }
};

/**
 * GET /api/lab-reports/:submissionId
 * Fetches a single submission for a teacher.
 */
const getSubmissionById = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { submissionId } = req.params;

    const labReport = await LabReport.findByPk(submissionId, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'rollNumber'] },
        { model: Course, as: 'course', attributes: ['id', 'code', 'title'] }
      ]
    });

    if (!labReport) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const isAssigned = await CourseTeacher.findOne({
      where: { teacherId, courseId: labReport.courseId }
    });

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'Not authorized to view submissions for this course.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: labReport.id,
        studentName: labReport.student?.name ?? 'Unknown',
        rollNumber: labReport.student?.rollNumber ?? '—',
        courseId: labReport.courseId,
        courseCode: labReport.course?.code ?? '—',
        courseName: labReport.course?.title ?? '—',
        title: labReport.title,
        submittedAt: labReport.submittedAt,
        status: labReport.status,
        grade: labReport.grade,
        feedback: labReport.feedback,
        fileUrl: `http://localhost:5000/api/courses/${labReport.courseId}/lab-reports/${labReport.id}/download`,
        fileName: labReport.originalFileName,
        maxScore: 100 // Hardcoded max score
      }
    });
  } catch (error) {
    console.error('getSubmissionById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch submission.' });
  }
};

module.exports = { registerTeacher, getTeachers, getTeacherSubmissions, gradeSubmission, getSubmissionById };

