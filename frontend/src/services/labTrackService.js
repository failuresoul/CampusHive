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

const TEACHERS_API = 'http://localhost:5000/api/teachers';

/**
 * getTeacherSubmissions
 *
 * Fetches the paginated submission queue for the logged-in teacher.
 * Scoped automatically to their assigned courses on the backend.
 *
 * @param {{ status?, courseId?, page?, pageSize? }} params
 * @param {string} token – teacher JWT
 * @returns {Promise<{ submissions, pagination, courses }>}
 */
export const getTeacherSubmissions = async (
  { status = 'submitted', courseId = '', page = 1, pageSize = 25 } = {},
  token
) => {
  const params = { status, page, pageSize };
  if (courseId) params.courseId = courseId;

  const response = await axios.get(`${TEACHERS_API}/me/submissions`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  // response.data.data = { submissions, pagination, courses }
  return response.data.data;
};

/**
 * saveGrade
 *
 * Grades a submission.
 * @param {string} submissionId
 * @param {{ grade, feedback }} data
 * @param {string} token
 * @returns {Promise<any>}
 */
export const saveGrade = async (submissionId, data, token) => {
  const response = await axios.post(`http://localhost:5000/api/lab-reports/${submissionId}/grade`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * getTeacherSubmission
 *
 * Fetches a single submission detail for the teacher.
 */
export const getTeacherSubmission = async (submissionId, token) => {
  const response = await axios.get(`http://localhost:5000/api/lab-reports/${submissionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

