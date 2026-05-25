import { axiosAdmin } from './api.js';

const BASE = '/ratings';

export const getRatings = ({ restaurant, userId, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (restaurant) params.restaurant = restaurant;
  if (userId)     params.userId     = userId;
  return axiosAdmin.get(BASE, { params });
};

export const createRating = (data) => axiosAdmin.post(BASE, data);

export const deleteRating = (id) => axiosAdmin.delete(`${BASE}/${id}`);
