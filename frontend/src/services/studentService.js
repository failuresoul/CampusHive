import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

/**
 * Bulk import students via CSV payload
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
