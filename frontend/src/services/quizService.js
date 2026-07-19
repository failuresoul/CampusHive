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

export const getQuizDetails = async (courseId, quizId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/courses/${courseId}/quizzes/${quizId}`,
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
    throw new Error('An unexpected error occurred while fetching quiz details.');
  }
};

export const launchQuiz = async (courseId, quizId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/courses/${courseId}/quizzes/${quizId}/launch`,
      {},
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
    throw new Error('An unexpected error occurred while launching the quiz.');
  }
};

/**
 * Fetches the current leaderboard for a quiz (REST fallback / resync).
 * GET /api/quizzes/:quizId/leaderboard
 */
export const getLeaderboard = async (quizId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/quizzes/${quizId}/leaderboard`,
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
    throw new Error('An unexpected error occurred while fetching leaderboard.');
  }
};

/**
 * Fetches the student results for a quiz.
 * GET /api/quizzes/:quizId/results
 */
export const getMyQuizResults = async (quizId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/quizzes/${quizId}/results`,
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
    throw new Error('An unexpected error occurred while fetching quiz results.');
  }
};

/**
 * Fetches the teacher analytics for a quiz.
 * GET /api/quizzes/:quizId/analytics
 */
export const getQuizAnalytics = async (quizId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/quizzes/${quizId}/analytics`,
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
    throw new Error('An unexpected error occurred while fetching quiz analytics.');
  }
};
