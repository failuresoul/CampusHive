import axios from 'axios';

const API_URL = 'http://localhost:5000/api/study-sessions';

/**
 * createStudySession
 * Creates a study session post on the backend.
 * 
 * @param {Object} payload - { title, courseId, dateTime, location, description, maxParticipants }
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} API response data
 */
export const createStudySession = async (payload, token) => {
  const response = await axios.post(API_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
