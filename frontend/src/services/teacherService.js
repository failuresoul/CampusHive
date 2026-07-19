import axios from 'axios';

const API_URL = 'http://localhost:5000/api/teachers';

/**
 * registerTeacher
 *
 * Calls POST /api/teachers to create a new teacher account.
 *
 * @param {{
 *   name:        string,
 *   email:       string,
 *   department:  string,
 *   designation: string,
 *   phone:       string,
 *   password:    string
 * }} payload
 * @param {string} token – admin JWT bearer token
 *
 * @returns {Promise<{
 *   id:          string,
 *   name:        string,
 *   email:       string,
 *   department:  string,
 *   designation: string,
 *   createdAt:   string
 * }>} The created teacher's safe profile (no password hash)
 *
 * @throws {AxiosError} – caller should inspect err.response.data for
 *   { success, message, errors? } and surface it to the user.
 */
export const registerTeacher = async (payload, token) => {
  const response = await axios.post(API_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // response.data = { success: true, data: { id, name, email, … } }
  return response.data.data;
};

/**
 * getTeachers
 *
 * Fetches a paginated, filtered list of teachers from the API.
 *
 * @param {Object} params
 *   search     – partial text match on name / email
 *   department – exact filter
 *   page       – 1-indexed page number
 *   pageSize   – items per page
 * @param {string} token – JWT bearer token
 *
 * @returns {Promise<{
 *   teachers:   Array,
 *   pagination: { page, pageSize, totalItems, totalPages }
 * }>}
 */
export const getTeachers = async (
  {
    search     = '',
    department = '',
    page       = 1,
    pageSize   = 25,
    sortBy     = 'name',
    sortOrder  = 'asc',
  } = {},
  token
) => {
  const response = await axios.get(API_URL, {
    params: { search, department, page, pageSize, sortBy, sortOrder },
    headers: { Authorization: `Bearer ${token}` },
  });
  // response.data.data = { teachers, pagination }
  return response.data.data;
};
