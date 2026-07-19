import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createQuiz = async (courseId, payload, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/quizzes`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data; // Throw backend error format { success: false, message: '...' }
    }
    throw new Error('An unexpected error occurred while saving the quiz.');
  }
};

export const getTeacherQuizzes = async (courseId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/quizzes`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred while fetching quizzes.');
  }
};
