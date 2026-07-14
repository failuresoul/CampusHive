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

export const getMySubmissions = async (courseId, token) => {
  const response = await axios.get(`${API_URL}/${courseId}/lab-reports/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const downloadLabReport = async (courseId, reportId, token, fileName) => {
  const response = await axios.get(`${API_URL}/${courseId}/lab-reports/${reportId}/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob', // Important for downloading files
  });
  
  // Create a blob and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName || 'lab-report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getSubmissionDetail = async (courseId, reportId, token) => {
  const response = await axios.get(`${API_URL}/${courseId}/lab-reports/${reportId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
