import { axiosAdmin } from './api.js';

const BASE = '/restaurants';

export const getRestaurants = ({ search, isActive, category, page = 1, limit = 20, adminUserId } = {}) => {
  const params = { page, limit };
  if (search) params.search = search;
  // 'all' → no filter (service defaults active-only without it, so pass 'all' explicitly)
  if (isActive === undefined || isActive === 'all') {
    params.isActive = 'all';
  } else {
    params.isActive = isActive;
  }
  if (category && category !== 'all') params.category = category;
  if (adminUserId) params.adminUserId = adminUserId;
  return axiosAdmin.get(BASE, { params });
};

export const getRestaurantById = (id) => axiosAdmin.get(`${BASE}/${id}`);

export const createRestaurant = (data) => axiosAdmin.post(BASE, data);

export const updateRestaurant = (id, data) => axiosAdmin.put(`${BASE}/${id}`, data);

export const activateRestaurant = (id) => axiosAdmin.patch(`${BASE}/${id}/activate`);

export const deactivateRestaurant = (id) => axiosAdmin.patch(`${BASE}/${id}/deactivate`);

export const assignRestaurantAdmin = (id, userId) =>
  axiosAdmin.put(`${BASE}/${id}/admins`, { userId });

export const unassignRestaurantAdmin = (id, userId) =>
  axiosAdmin.put(`${BASE}/${id}/admins`, { userId, remove: true });
