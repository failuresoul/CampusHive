const { StudySession, Enrollment } = require('../models/associations');

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

module.exports = {
  createStudySession,
};
