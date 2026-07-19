import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lost-found-items';

export const postItem = async (formData, token) => {
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
