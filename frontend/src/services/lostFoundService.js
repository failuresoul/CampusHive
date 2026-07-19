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

export const getItemById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    if (err.response && (err.response.status === 404 || err.response.status === 405)) {
      const listResponse = await getItems({ status: 'all', pageSize: 1000 }, token);
      if (listResponse && listResponse.success) {
        const item = listResponse.data.items.find(i => String(i.id) === String(id));
        if (item) {
          return { success: true, data: item };
        }
      }
    }
    throw err;
  }
};

export const claimItem = async (id, message, token) => {
  // TODO: connect to POST /api/lost-found-items/:id/claim in Story 5
  return { success: true, message: 'Claim submitted successfully' };
};
