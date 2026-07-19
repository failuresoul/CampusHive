const RollNumberCounter = require('../models/RollNumberCounter');
const User = require('../models/User');
const Course = require('../models/Course');
const sequelize = require('../config/database');
const { Transaction, Op, fn, col } = require('sequelize');
const bcrypt = require('bcrypt');
const { MaterialBookmark, CourseMaterial } = require('../models/associations');

// ── Allowed values (whitelist to prevent SQL injection via query params) ───────

const ALLOWED_SORT_FIELDS = {
  name:       'name',
  rollNumber: 'rollNumber',
  batch:      'batch',
};
const ALLOWED_SORT_ORDERS = ['asc', 'desc'];
const MAX_PAGE_SIZE = 100;

/**
 * GET /api/students
 *
 * Query params:
 *   search     – partial match on name / email / rollNumber (case-insensitive)
 *   department – exact match
 *   batch      – exact match
 *   status     – 'active' | 'inactive'
 *   page       – 1-indexed, default 1
 *   pageSize   – default 25, max 100
 *   sortBy     – 'name' | 'rollNumber' | 'batch', default 'name'
 *   sortOrder  – 'asc' | 'desc', default 'asc'
 *
 * Response:
 *   { success, data: { students, pagination: { page, pageSize, totalItems, totalPages } } }
 */
const getStudents = async (req, res) => {
  try {
    const {
      search     = '',
      department = '',
      batch      = '',
      status     = '',
      page       = '1',
      pageSize   = '25',
      sortBy     = 'name',
      sortOrder  = 'asc',
    } = req.query;

    // ── Sanitise & validate ──────────────────────────────────────────────────

    const pageNum  = Math.max(1, parseInt(page, 10) || 1);
    const pageSz   = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));
    const offset   = (pageNum - 1) * pageSz;

    const safeSort  = ALLOWED_SORT_FIELDS[sortBy]  || 'name';
    const safeOrder = ALLOWED_SORT_ORDERS.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : 'asc';

    // ── Build WHERE clause ───────────────────────────────────────────────────

    const where = { role: 'student' };

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { name:       { [Op.like]: q } },
        { email:      { [Op.like]: q } },
        { rollNumber: { [Op.like]: q } },
      ];
    }

    if (department) where.department = department;
    if (batch)      where.batch      = batch;
    if (status)     where.status     = status;

    // ── Query DB ─────────────────────────────────────────────────────────────

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'email', 'rollNumber',
        'department', 'batch', 'phone', 'status',
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
        students: rows,
        pagination: {
          page:       pageNum,
          pageSize:   pageSz,
          totalItems: count,
          totalPages: Math.max(1, Math.ceil(count / pageSz)),
        },
      },
    });
  } catch (error) {
    console.error('getStudents error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch students.',
    });
  }
};

// Simple FIFO Mutex to serialize roll number generation requests at the application level.
// This prevents concurrent database locks (like SQLITE_BUSY in SQLite) and ensures absolute race safety.
let rollNumberLock = false;
const rollNumberWaitingQueue = [];

const acquireRollNumberLock = () => {
  if (!rollNumberLock) {
    rollNumberLock = true;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    rollNumberWaitingQueue.push(resolve);
  });
};

const releaseRollNumberLock = () => {
  if (rollNumberWaitingQueue.length > 0) {
    const nextResolve = rollNumberWaitingQueue.shift();
    nextResolve();
  } else {
    rollNumberLock = false;
  }
};

/**
 * Formats a roll number according to the CSE-2023-0001 format.
 * Extracts the start year from a batch string (e.g., '2023-2024' -> '2023').
 */
const formatRollNumber = (department, batch, sequence) => {
  const startYear = batch.split('-')[0];
  const paddedSeq = String(sequence).padStart(4, '0');
  return `${department.toUpperCase()}-${startYear}-${paddedSeq}`;
};

/**
 * Atomically generates and increments the next roll number for a department + batch.
 * Race-condition safe using a database transaction and application-level lock serialization.
 */
const generateRollNumber = async (department, batch, transaction = null) => {
  const executeGeneration = async (t) => {
    const isSqlite = sequelize.options.dialect === 'sqlite';
    
    let counter = await RollNumberCounter.findOne({
      where: { department, batch },
      transaction: t,
      lock: isSqlite ? false : t.LOCK.UPDATE,
    });

    if (!counter) {
      try {
        counter = await RollNumberCounter.create({
          department,
          batch,
          lastSequence: 0,
        }, { transaction: t });
      } catch (err) {
        // Handle concurrent inserts: if unique key constraint fails, select the existing one
        counter = await RollNumberCounter.findOne({
          where: { department, batch },
          transaction: t,
          lock: isSqlite ? false : t.LOCK.UPDATE,
        });
      }
    }

    const nextSeq = counter.lastSequence + 1;
    await counter.update({ lastSequence: nextSeq }, { transaction: t });
    return formatRollNumber(department, batch, nextSeq);
  };

  // If a transaction was passed from caller, use it. Otherwise, create a new transaction.
  if (transaction) {
    return await executeGeneration(transaction);
  } else {
    // Acquire the application-level lock
    await acquireRollNumberLock();
    try {
      const txOptions = {};
      if (sequelize.options.dialect === 'sqlite') {
        txOptions.type = Transaction.TYPES.IMMEDIATE;
      }
      return await sequelize.transaction(txOptions, executeGeneration);
    } finally {
      // Always release lock
      releaseRollNumberLock();
    }
  }
};

/**
 * POST /api/students/preview-roll-number
 * Returns the next roll number without incrementing the counter (a "peek" helper).
 */
const previewRollNumber = async (req, res) => {
  try {
    const { department, batch } = req.body;

    if (!department || !batch) {
      return res.status(400).json({
        success: false,
        message: 'Department and batch are required.',
      });
    }

    // Peek at the last sequence number (read-only, no locks)
    const counter = await RollNumberCounter.findOne({
      where: { department, batch },
    });

    const nextSeq = counter ? counter.lastSequence + 1 : 1;
    const rollNumber = formatRollNumber(department, batch, nextSeq);

    return res.status(200).json({
      success: true,
      data: {
        rollNumber,
      },
    });
  } catch (error) {
    console.error('Preview roll number error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate roll number preview.',
    });
  }
};

/**
 * POST /api/students/bulk-import
 * Validates, deduplicates, and imports students. Assigns roll numbers atomically.
 */
const bulkImport = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: rows array required.' });
    }

    if (rows.length > 500) {
      return res.status(400).json({ success: false, message: 'Max batch size is 500 rows.' });
    }

    const imported = [];
    const skipped = [];
    
    // In-batch duplicate tracking
    const seenEmails = new Set();
    
    // Pre-validate rows and find in-batch duplicates
    const validRows = [];
    for (const rowObj of rows) {
      const { originalIndex, data } = rowObj;
      const { name, email, dob, department, batch, phone } = data || {};
      
      const isEmpty = (val) => !val || val.trim() === '';
      
      let rowErrors = [];
      ['name', 'email', 'dob', 'department', 'batch'].forEach(field => {
        if (isEmpty(data[field])) rowErrors.push(`Missing ${field}`);
      });
      
      if (!isEmpty(email)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          rowErrors.push('Invalid email format');
        }
      }

      if (rowErrors.length > 0) {
        skipped.push({ row: originalIndex, email, reason: rowErrors.join(', ') });
        continue;
      }
      
      const normalizedEmail = email.trim().toLowerCase();
      if (seenEmails.has(normalizedEmail)) {
        skipped.push({ row: originalIndex, email: normalizedEmail, reason: 'Duplicate email in uploaded batch' });
        continue;
      }
      
      seenEmails.add(normalizedEmail);
      validRows.push({ originalIndex, ...data, email: normalizedEmail });
    }

    if (validRows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { imported, skipped }
      });
    }

    // Check DB for existing emails
    const existingUsers = await User.findAll({
      where: { email: { [Op.in]: Array.from(seenEmails) } },
      attributes: ['email']
    });
    const existingEmails = new Set(existingUsers.map(u => u.email));

    const defaultPasswordHash = await bcrypt.hash('CampusHive@123', 10);

    for (const row of validRows) {
      if (existingEmails.has(row.email)) {
        skipped.push({ row: row.originalIndex, email: row.email, reason: 'Duplicate email in database' });
        continue;
      }

      // We must serialize roll number generation.
      await acquireRollNumberLock();
      try {
        const txOptions = {};
        if (sequelize.options.dialect === 'sqlite') {
          txOptions.type = Transaction.TYPES.IMMEDIATE;
        }

        await sequelize.transaction(txOptions, async (t) => {
          const rollNumber = await generateRollNumber(row.department, row.batch, t);
          
          await User.create({
            name:         row.name.trim(),
            email:        row.email,
            passwordHash: defaultPasswordHash,
            role:         'student',
            rollNumber,
            department:   row.department,
            batch:        row.batch,
            phone:        row.phone ? row.phone.trim() : null,
            status:       'active',
          }, { transaction: t });

          imported.push({ email: row.email, rollNumber });
        });
      } catch (err) {
        console.error(`Error importing row ${row.originalIndex}:`, err);
        skipped.push({ row: row.originalIndex, email: row.email, reason: 'Database error during insert' });
      } finally {
        releaseRollNumberLock();
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        imported,
        skipped
      }
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk import.',
    });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findByPk(studentId, {
      include: [{
        model: Course,
        as: 'enrolledCourses',
        attributes: ['id', 'code', 'title', 'creditHours'],
        include: [{
          model: User,
          as: 'teachers',
          attributes: ['name'],
          through: { attributes: [] } // Exclude CourseTeacher junction fields
        }],
        through: { attributes: [] } // Exclude Enrollment junction fields
      }]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const courses = student.enrolledCourses.map(course => {
      // Assuming a course has at least one teacher, otherwise 'Not Assigned'
      const teacherName = course.teachers && course.teachers.length > 0 
        ? course.teachers.map(t => t.name).join(', ') 
        : 'Not Assigned';
        
      return {
        id: course.id,
        code: course.code,
        title: course.title,
        creditHours: course.creditHours,
        teacherName
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        courses
      }
    });

  } catch (error) {
    console.error('getMyCourses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses.',
    });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const studentId = req.user.id;

    const bookmarks = await MaterialBookmark.findAll({
      where: { studentId },
      include: [
        {
          model: CourseMaterial,
          as: 'material',
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'name', 'email'],
            },
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'code', 'title'],
            },
          ],
        },
      ],
      order: [['bookmarkedAt', 'DESC']],
    });

    const materials = bookmarks.map((b) => {
      if (!b.material) return null;
      const plain = b.material.toJSON();
      plain.isBookmarked = true;
      return plain;
    }).filter(Boolean);

    return res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Error in getBookmarks controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching bookmarked materials.',
    });
  }
};

module.exports = {
  getStudents,
  generateRollNumber,
  previewRollNumber,
  bulkImport,
  getMyCourses,
  getBookmarks,
};
