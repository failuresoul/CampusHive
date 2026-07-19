const { StudySession, Enrollment, User, Course, StudySessionRsvp } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * createStudySession
 * POST /api/study-sessions
 * Creates a new collaborative study session.
 */
const createStudySession = async (req, res) => {
  try {
    const { title, courseId, dateTime, location, description, maxParticipants } = req.body;
    const creatorId = req.user.id;

    // Validate required fields
    if (!title || !courseId || !dateTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Title, courseId, dateTime, and location are required.'
      });
    }

    // Validate dateTime is in the future
    const sessionDate = new Date(dateTime);
    if (isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: Session date and time must be in the future.'
      });
    }

    // Validate maxParticipants if provided
    let parsedMax = null;
    if (maxParticipants !== undefined && maxParticipants !== null && maxParticipants !== '') {
      parsedMax = Number(maxParticipants);
      if (isNaN(parsedMax) || parsedMax <= 0 || !Number.isInteger(parsedMax)) {
        return res.status(400).json({
          success: false,
          message: 'Validation error: Max participants must be a positive whole number.'
        });
      }
    }

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      where: {
        studentId: creatorId,
        courseId
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not enrolled in this course.'
      });
    }

    // Create study session post
    const session = await StudySession.create({
      creatorId,
      courseId,
      title,
      description: description || null,
      location,
      sessionDateTime: sessionDate,
      maxParticipants: parsedMax
    });

    return res.status(201).json({
      success: true,
      data: {
        id: session.id,
        title: session.title,
        sessionDateTime: session.sessionDateTime
      }
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not create study session.'
    });
  }
};

/**
 * getStudySessions
 * GET /api/study-sessions
 * Retrieves a paginated list of study sessions, optionally filtered by course and upcoming status.
 */
const getStudySessions = async (req, res) => {
  try {
    const { courseId, upcoming, page, pageSize } = req.query;

    const pageNum = parseInt(page) || 1;
    const limit = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * limit;

    const whereClause = {};

    // Filter by course if provided
    if (courseId) {
      whereClause.courseId = courseId;
    }

    // Filter upcoming (default true)
    const isUpcoming = upcoming === undefined || upcoming === 'true';
    if (isUpcoming) {
      whereClause.sessionDateTime = {
        [Op.gte]: new Date()
      };
    }

    const { count, rows } = await StudySession.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['code', 'title']
        }
      ],
      order: [['sessionDateTime', 'ASC']],
      limit,
      offset
    });

    // Fetch real-time RSVP counts for all fetched sessions
    const sessionIds = rows.map(s => s.id);
    const rsvps = await StudySessionRsvp.findAll({
      where: { sessionId: sessionIds }
    });

    // Format output and add real RSVP count
    const sessions = rows.map(session => {
      const plain = session.get({ plain: true });
      const currentRsvps = rsvps.filter(r => r.sessionId === session.id).length;
      return {
        ...plain,
        rsvpCount: currentRsvps
      };
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: pageNum,
          pageSize: limit,
          totalItems: count,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not fetch study sessions.'
    });
  }
};

/**
 * getStudySessionById
 * GET /api/study-sessions/:id
 * Fetches details of a specific study session.
 */
const getStudySessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await StudySession.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['name']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['code', 'title']
        },
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found.'
      });
    }

    const rsvpCount = session.participants.length;
    const hasRsvpd = session.participants.some(p => p.id === userId);

    return res.status(200).json({
      success: true,
      data: {
        ...session.get({ plain: true }),
        rsvpCount,
        hasRsvpd
      }
    });
  } catch (error) {
    console.error('Error fetching study session details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not fetch study session details.'
    });
  }
};

/**
 * rsvpToSession
 * POST /api/study-sessions/:id/rsvp
 * RSVPs the student to a study session (safe from race condition under transaction lock).
 */
const rsvpToSession = async (req, res) => {
  const sessionId = req.params.id;
  const studentId = req.user.id;

  const isSqlite = sequelize.options.dialect === 'sqlite';
  const useLock = sequelize.options.dialect === 'mysql' || sequelize.options.dialect === 'postgres';
  const transactionOptions = isSqlite ? { type: 'IMMEDIATE' } : {};

  try {
    await sequelize.transaction(transactionOptions, async (t) => {
      // Find the session and lock the row (if supported by dialect)
      const session = await StudySession.findByPk(sessionId, {
        transaction: t,
        ...(useLock ? { lock: true } : {})
      });

      if (!session) {
        const error = new Error('Study session not found.');
        error.status = 404;
        throw error;
      }

      // Check if session is in the future
      if (new Date(session.sessionDateTime) <= new Date()) {
        const error = new Error('Cannot RSVP to a past study session.');
        error.status = 400;
        throw error;
      }

      // Check if already RSVP'd
      const existingRsvp = await StudySessionRsvp.findOne({
        where: { sessionId, studentId },
        transaction: t
      });

      if (existingRsvp) {
        const error = new Error('You have already RSVP\'d to this study session.');
        error.status = 409;
        throw error;
      }

      // Check capacity
      if (session.maxParticipants) {
        const currentCount = await StudySessionRsvp.count({
          where: { sessionId },
          transaction: t
        });

        if (currentCount >= session.maxParticipants) {
          const error = new Error('This study session has reached maximum capacity.');
          error.status = 409;
          throw error;
        }
      }

      // Record RSVP
      await StudySessionRsvp.create({
        sessionId,
        studentId
      }, { transaction: t });
    });

    return res.status(201).json({
      success: true,
      message: 'RSVP successful.'
    });
  } catch (error) {
    console.error('Error during RSVP:', error);
    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Server error: Could not complete RSVP.'
    });
  }
};

/**
 * cancelRsvp
 * DELETE /api/study-sessions/:id/rsvp
 * Cancels a student's own RSVP to a study session.
 */
const cancelRsvp = async (req, res) => {
  const sessionId = req.params.id;
  const studentId = req.user.id;

  try {
    const deletedCount = await StudySessionRsvp.destroy({
      where: {
        sessionId,
        studentId
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active RSVP found for this study session.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'RSVP cancelled successfully.'
    });
  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: Could not cancel RSVP.'
    });
  }
};

module.exports = {
  createStudySession,
  getStudySessions,
  getStudySessionById,
  rsvpToSession,
  cancelRsvp,
};
