import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses';

export const courseHubService = {
  /**
   * uploadMaterials
   * Sends a POST request containing multiple files and index-aligned titles, categories, and descriptions.
   *
   * @param {string} courseId - ID of the course
   * @param {Array} filesList - Array of objects: { file, title, category, description }
   * @param {string} token - JWT bearer token
   * @returns {Promise<Object>} Server response data containing uploaded and failed lists.
   */
  uploadMaterials: async (courseId, filesList, token) => {
    const formData = new FormData();
    filesList.forEach((fileEntry) => {
      formData.append('files', fileEntry.file);
      formData.append('title', fileEntry.title || fileEntry.file.name);
      formData.append('category', fileEntry.category || 'Lecture Notes');
      formData.append('description', fileEntry.description || '');
    });

    const response = await axios.post(`${API_URL}/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * getMaterials
   * Fetches learning materials for a course with optional filters.
   *
   * @param {string} courseId - ID of the course
   * @param {Object} params - { category, search }
   * @param {string} token - JWT bearer token
   * @returns {Promise<Object>} Response containing materials list
   */
  getMaterials: async (courseId, params, token) => {
    const response = await axios.get(`${API_URL}/${courseId}/materials`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * deleteMaterial
   * Deletes a learning material by ID.
   *
   * @param {string} courseId - ID of the course
   * @param {string} materialId - ID of the material
   * @param {string} token - JWT bearer token
   * @returns {Promise<Object>} Response data
   */
  deleteMaterial: async (courseId, materialId, token) => {
    const response = await axios.delete(`${API_URL}/${courseId}/materials/${materialId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * downloadMaterial
   * Downloads a course material securely.
   *
   * @param {string} materialId - ID of the material
   * @param {string} token - JWT bearer token
   * @param {string} originalFileName - Original filename for the saved file
   */
  downloadMaterial: async (materialId, token, originalFileName) => {
    const response = await axios.get(`http://localhost:5000/api/materials/${materialId}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName || 'material';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * toggleBookmark
   * Bookmarks or unbookmarks a material for a student.
   *
   * @param {string} materialId - ID of the material
   * @param {boolean} isBookmarked - Desired bookmarked state (true to bookmark, false to unbookmark)
   * @param {string} token - JWT bearer token
   * @returns {Promise<Object>} Response data
   */
  toggleBookmark: async (materialId, isBookmarked, token) => {
    const url = `http://localhost:5000/api/materials/${materialId}/bookmark`;
    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    if (isBookmarked) {
      const response = await axios.post(url, {}, { headers });
      return response.data;
    } else {
      const response = await axios.delete(url, { headers });
      return response.data;
    }
  },

  /**
   * getMyBookmarks
   * Fetches all bookmarked materials for the current student.
   *
   * @param {string} token - JWT bearer token
   * @returns {Promise<Object>} Response data containing materials list
   */
  getMyBookmarks: async (token) => {
    const response = await axios.get('http://localhost:5000/api/students/me/bookmarks', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
