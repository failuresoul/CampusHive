import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses';

/**
 * createCourse
 *
 * Sends a POST request to create a new academic course.
 *
 * @param {Object} payload
 *   code          - Unique code (e.g. CSE-3106)
 *   title         - Course title
 *   department    - Department (e.g. CSE, EEE)
 *   creditHours   - Credit hours (1-5)
 *   applicability - Semester/Batch applicability
 *   description   - Description (optional)
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} The server response data containing the created course.
 */
export const createCourse = async (payload, token) => {
  const response = await axios.post(API_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
