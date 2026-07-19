import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

export const dashboardService = {
  getAdminStats: async (token) => {
    const response = await axios.get(`${API_URL}/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  getTeacherStats: async (token) => {
    const response = await axios.get(`${API_URL}/teacher`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  getStudentStats: async (token) => {
    const response = await axios.get(`${API_URL}/student`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
export default dashboardService;
