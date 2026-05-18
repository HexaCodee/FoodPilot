import { axiosOrders } from './api.js';

const BASE = '/orders';

export const getOrders = ({ page = 1, limit = 50 } = {}) =>
  axiosOrders.get(BASE, { params: { page, limit } });

export const getOrderById = (id) => axiosOrders.get(`${BASE}/${id}`);

export const updateOrderStatus = (id, status) =>
  axiosOrders.put(`${BASE}/${id}/status`, { status });
