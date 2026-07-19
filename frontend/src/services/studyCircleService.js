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

/**
 * getStudySessions
 * Fetches a list of study sessions based on optional courseId, upcoming status, and pagination.
 * 
 * @param {Object} params - { courseId, upcoming, page, pageSize }
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} API response data containing sessions list and pagination info
 */
export const getStudySessions = async ({ courseId = '', upcoming = true, page = 1, pageSize = 10 } = {}, token) => {
  const response = await axios.get(API_URL, {
    params: {
      courseId,
      upcoming,
      page,
      pageSize,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

/**
 * getStudySessionDetails
 * Fetches full details for a specific study session.
 * 
 * @param {string} id - The study session ID
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} The server response containing session details, participants, and status
 */
export const getStudySessionDetails = async (id, token) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

/**
 * rsvpToSession
 * RSVPs the currently logged-in student to a study session.
 * 
 * @param {string} id - The study session ID
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} Response status
 */
export const rsvpToSession = async (id, token) => {
  const response = await axios.post(`${API_URL}/${id}/rsvp`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * cancelRsvp
 * Cancels the student's RSVP to a study session.
 * 
 * @param {string} id - The study session ID
 * @param {string} token - JWT bearer token
 * @returns {Promise<Object>} Response status
 */
export const cancelRsvp = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}/rsvp`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
