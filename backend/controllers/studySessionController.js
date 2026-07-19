const { StudySession, Enrollment, User, Course } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * createStudySession
 * POST /api/study-sessions
 * Creates a new collaborative study session.
 * 
 * Validations:
 * - Title, courseId, dateTime, and location are required.
 * - dateTime must be in the future.
 * - maxParticipants must be a positive integer if provided.
 * - Logged-in student must be enrolled in courseId.
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
    // If upcoming is 'true' (or default), only show sessions in the future (sessionDateTime >= now)
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

    // Format output and add placeholder rsvpCount
    const sessions = rows.map(session => {
      const plain = session.get({ plain: true });
      return {
        ...plain,
        rsvpCount: 0 // Placeholder until Story 5
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

module.exports = {
  createStudySession,
  getStudySessions,
};
