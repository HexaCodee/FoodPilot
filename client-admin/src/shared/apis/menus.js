import { axiosAdmin } from './api.js';

const BASE = '/menus';

export const getMenus = ({ restaurant, category, page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  if (restaurant) params.restaurant = restaurant;
  if (category && category !== 'all') params.category = category;
  return axiosAdmin.get(BASE, { params });
};

export const createMenu = (data) => axiosAdmin.post(BASE, data);

export const updateMenu = (id, data) => axiosAdmin.put(`${BASE}/${id}`, data);

export const activateMenu   = (id) => axiosAdmin.patch(`${BASE}/${id}/activate`);
export const deactivateMenu = (id) => axiosAdmin.patch(`${BASE}/${id}/deactivate`);
