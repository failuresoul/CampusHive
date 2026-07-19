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

export const getItems = async (filters = {}, token) => {
  const { type, category, status, search, page, pageSize } = filters;
  const params = {};
  if (type) params.type = type;
  if (category) params.category = category;
  if (status) params.status = status;
  if (search) params.search = search;
  if (page) params.page = page;
  if (pageSize) params.pageSize = pageSize;

  const response = await axios.get(API_URL, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
