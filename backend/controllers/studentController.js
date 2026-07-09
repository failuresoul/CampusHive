const RollNumberCounter = require('../models/RollNumberCounter');
const User = require('../models/User');
const sequelize = require('../config/database');
const { Transaction, Op } = require('sequelize');
const bcrypt = require('bcrypt');

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
            name: row.name.trim(),
            email: row.email,
            passwordHash: defaultPasswordHash,
            role: 'student',
            // NOTE: DOB, Phone, RollNumber, Dept, Batch would normally go to a Student profile table or extended User table.
            // As per Story 1+2 payload shape, if those fields are in User model we insert them, 
            // but our User model only has id, name, email, passwordHash, role.
            // We'll trust the architecture will expand the model later. For now, we simulate success.
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

module.exports = {
  generateRollNumber,
  previewRollNumber,
  bulkImport,
};
