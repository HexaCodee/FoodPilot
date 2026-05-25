import { axiosAdmin } from './api.js';

const BASE = '/promotions';

export const getPromotions = ({ restaurantId, isActive } = {}) => {
  const params = {};
  if (restaurantId !== undefined) params.restaurant = restaurantId; // backend expects ?restaurant=
  if (isActive !== undefined) params.isActive = isActive;
  return axiosAdmin.get(BASE, { params });
};

export const getPromotionById = (id) => axiosAdmin.get(`${BASE}/${id}`);

export const createPromotion = (data) => axiosAdmin.post(BASE, data);

export const updatePromotion = (id, data) => axiosAdmin.put(`${BASE}/${id}`, data);

export const deletePromotion = (id) => axiosAdmin.delete(`${BASE}/${id}`);
