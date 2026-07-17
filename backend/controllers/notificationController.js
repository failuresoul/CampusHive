const Notification = require('../models/Notification');

/**
 * GET /api/students/me/notifications
 *
 * Returns all notifications for the logged-in student, newest first.
 * Protected by authMiddleware + roleMiddleware(['student']).
 */
const getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId: studentId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('getMyNotifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
};

/**
 * PATCH /api/students/me/notifications/:id/read
 *
 * Marks a single notification as read.
 * Ensures the notification belongs to the requesting student (403/404).
 * Protected by authMiddleware + roleMiddleware(['student']).
 */
const markNotificationRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notificationId = parseInt(req.params.id, 10);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification id',
      });
    }

    const notification = await Notification.findByPk(notificationId);

    // 404 if it doesn't exist at all
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // 403 if it belongs to a different student
    if (notification.userId !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: This notification does not belong to you',
      });
    }

    // Already read — idempotent success
    if (notification.isRead) {
      return res.status(200).json({
        success: true,
        data: notification,
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('markNotificationRead error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
};
