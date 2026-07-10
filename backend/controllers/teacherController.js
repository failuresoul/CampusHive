const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const User = require('../models/User');

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_PAGE_SIZE = 100;

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
    } = req.query;

    // ── Sanitise & validate ──────────────────────────────────────────────────

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSz  = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));
    const offset  = (pageNum - 1) * pageSz;

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
      order:  [['name', 'ASC']],
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

module.exports = { registerTeacher, getTeachers };
