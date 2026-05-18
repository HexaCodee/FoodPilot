import { axiosOrders } from './api.js';

const BASE = '/reservations';

export const getReservations = ({ page = 1, limit = 50 } = {}) =>
  axiosOrders.get(BASE, { params: { page, limit } });

export const getReservationById = (id) => axiosOrders.get(`${BASE}/${id}`);

export const cancelReservation   = (id) => axiosOrders.put(`${BASE}/${id}/cancel`);
export const completeReservation = (id) => axiosOrders.put(`${BASE}/${id}/complete`);
