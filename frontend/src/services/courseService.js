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

/**
 * getCourses
 * Fetches the course list, supporting an optional search string.
 */
export const getCourses = async (search = '', token) => {
  const response = await axios.get(API_URL, {
    params: { search },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // response.data = { success: true, data: [...] }
  return response.data.data;
};

/**
 * getCourseTeachers
 * Fetches teachers currently assigned to the given course.
 */
export const getCourseTeachers = async (courseId, token) => {
  const response = await axios.get(`${API_URL}/${courseId}/teachers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data;
};

/**
 * assignTeacher
 * Maps a teacher to a course.
 */
export const assignTeacher = async (courseId, teacherId, token) => {
  const response = await axios.post(
    `${API_URL}/${courseId}/teachers`,
    { teacherId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * removeTeacherAssignment
 * Deletes a course-teacher mapping.
 */
export const removeTeacherAssignment = async (courseId, teacherId, token) => {
  const response = await axios.delete(`${API_URL}/${courseId}/teachers/${teacherId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
