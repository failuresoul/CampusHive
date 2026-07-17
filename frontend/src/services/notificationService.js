import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

/**
 * Returns the stored JWT from localStorage.
 * Mirrors the pattern used in courseService / studentService.
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * GET /api/students/me/notifications
 * Returns the logged-in student's notifications, newest first.
 *
 * @returns {Promise<Array>} Array of Notification objects
 */
const getMyNotifications = async () => {
  const response = await axios.get(`${API_URL}/me/notifications`, {
    headers: getAuthHeader(),
  });
  // response.data = { success: true, data: [...] }
  return response.data.data;
};

/**
 * PATCH /api/students/me/notifications/:id/read
 * Marks a single notification as read.
 *
 * @param {number} id – Notification id
 * @returns {Promise<Object>} Updated Notification object
 */
const markAsRead = async (id) => {
  const response = await axios.patch(
    `${API_URL}/me/notifications/${id}/read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data.data;
};

export const notificationService = {
  getMyNotifications,
  markAsRead,
};
