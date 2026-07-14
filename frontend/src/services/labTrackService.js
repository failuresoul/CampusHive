import axios from 'axios';

const API_URL = 'http://localhost:5000/api/courses';

export const uploadLabReport = async (courseId, formData, token, onProgress) => {
  const response = await axios.post(`${API_URL}/${courseId}/lab-reports`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};
