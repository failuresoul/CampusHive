import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

/**
 * getStudents
 *
 * Fetches a paginated, filtered, sorted list of students from the API.
 *
 * @param {Object} params
 *   search     – partial text match on name / email / rollNumber
 *   department – exact filter
 *   batch      – exact filter
 *   status     – 'active' | 'inactive' | ''
 *   page       – 1-indexed page number
 *   pageSize   – items per page (10 | 25 | 50)
 *   sortBy     – 'name' | 'rollNumber' | 'batch'
 *   sortOrder  – 'asc' | 'desc'
 * @param {string} token – JWT bearer token
 *
 * @returns {Promise<{
 *   students: Array,
 *   pagination: { page, pageSize, totalItems, totalPages }
 * }>}
 */
export const getStudents = async (
  {
    search     = '',
    department = '',
    batch      = '',
    status     = '',
    page       = 1,
    pageSize   = 25,
    sortBy     = 'name',
    sortOrder  = 'asc',
  } = {},
  token
) => {
  const response = await axios.get(API_URL, {
    params: {
      search,
      department,
      batch,
      status,
      page,
      pageSize,
      sortBy,
      sortOrder,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // response.data.data = { students, pagination }
  return response.data.data;
};

/**
 * bulkImportStudents
 *
 * Bulk import students via CSV payload.
 * @param {Array} rows - Array of validated student objects
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} API response with imported and skipped arrays
 */
export const bulkImportStudents = async (rows, token) => {
  const response = await axios.post(
    `${API_URL}/bulk-import`,
    { rows },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * getMyCourses
 *
 * Fetches the enrolled courses for the currently logged-in student.
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} Array of course objects
 */
export const getMyCourses = async (token) => {
  const response = await axios.get(`${API_URL}/me/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.courses;
};
