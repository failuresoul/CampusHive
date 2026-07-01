import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const login = async (email, password, rememberMe) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
      rememberMe, // Passed to backend, backend can optionally use it for token expiry
    });
    return response.data; // { success: true, data: { token, user } }
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};

export const authService = {
  login,
};
