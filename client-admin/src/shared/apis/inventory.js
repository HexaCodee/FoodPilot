import { axiosAdmin } from './api.js';

const BASE = '/inventory';

export const getInventory = ({ restaurant, category, page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  if (restaurant) params.restaurant = restaurant;
  if (category && category !== 'all') params.category = category;
  return axiosAdmin.get(BASE, { params });
};

export const getInventoryById = (id) => axiosAdmin.get(`${BASE}/${id}`);

export const createInventoryItem = (data) => axiosAdmin.post(BASE, data);

export const updateInventoryItem = (id, data) => axiosAdmin.put(`${BASE}/${id}`, data);

export const deleteInventoryItem = (id) => axiosAdmin.delete(`${BASE}/${id}`);
