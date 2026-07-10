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
