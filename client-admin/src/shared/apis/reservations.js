import { axiosOrders } from './api.js';

const BASE = '/reservations';

export const getReservations = ({ page = 1, limit = 50, userId, tableId, restaurantId } = {}) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  if (tableId) params.tableId = tableId;
  if (restaurantId) params.restaurantId = restaurantId;
  return axiosOrders.get(BASE, { params });
};

export const getReservationById = (id) => axiosOrders.get(`${BASE}/${id}`);

export const createReservation = (data) => axiosOrders.post(BASE, data);

export const cancelReservation = (id) => axiosOrders.put(`${BASE}/${id}/cancel`);
export const completeReservation = (id) => axiosOrders.put(`${BASE}/${id}/complete`);
export const updateReservation = (id, data) => axiosOrders.put(`${BASE}/${id}`, data);
