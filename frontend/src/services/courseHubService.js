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
};
