const RollNumberCounter = require('../models/RollNumberCounter');
const sequelize = require('../config/database');
const { Transaction } = require('sequelize');

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

module.exports = {
  generateRollNumber,
  previewRollNumber,
};
