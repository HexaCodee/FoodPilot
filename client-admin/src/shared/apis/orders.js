import { axiosOrders } from './api.js';

const BASE = '/orders';

export const getOrders = ({ page = 1, limit = 50, userId } = {}) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  return axiosOrders.get(BASE, { params });
};

export const getOrderById = (id) => axiosOrders.get(`${BASE}/${id}`);

export const createOrder = (data) => axiosOrders.post(BASE, data);

export const updateOrderStatus = (id, status) =>
  axiosOrders.put(`${BASE}/${id}/status`, { status });

export const cancelOrder = (id) => axiosOrders.put(`${BASE}/${id}/cancel`);
