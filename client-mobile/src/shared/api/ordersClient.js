// client-mobile/src/shared/api/ordersClient.js
// Conecta con el Order Tracking Service (Node.js, puerto 3030)
// Maneja: pedidos y reservas
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore, getRefreshToken, saveRefreshToken } from '../store/authStore.js';

const ordersClient = axios.create({
  baseURL: ENDPOINTS.ORDERS.BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

ordersClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _isRefreshing = false;
let _queue = [];
const processQueue = (error, token = null) => {
  _queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  _queue = [];
};

ordersClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!original || original._retry || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    if (_isRefreshing) {
      return new Promise((resolve, reject) => _queue.push({ resolve, reject }))
        .then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return ordersClient(original);
        });
    }
    original._retry = true;
    _isRefreshing = true;
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      _isRefreshing = false;
      await useAuthStore.getState().logout();
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(
        `${ENDPOINTS.AUTH.BASE}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const { accessToken, refreshToken: newRefresh, userDetails } = data;
      await saveRefreshToken(newRefresh ?? refreshToken);
      useAuthStore.getState().setAccessToken(accessToken, userDetails);
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return ordersClient(original);
    } catch (err) {
      processQueue(err, null);
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ── Pedidos ───────────────────────────────────────────────────────────────────
export const getOrders = ({ userId, restaurantId, status, page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  if (restaurantId) params.restaurantId = restaurantId;
  if (status) params.status = status;
  return ordersClient.get('/orders', { params });
};

export const getOrderById = (id) =>
  ordersClient.get(`/orders/${id}`);

export const createOrder = (data) =>
  ordersClient.post('/orders', data);

export const cancelOrder = (id) =>
  ordersClient.put(`/orders/${id}/cancel`);

// ── Reservas ──────────────────────────────────────────────────────────────────
export const getReservations = ({ userId, restaurantId, tableId, page = 1, limit = 50 } = {}) => {
  const params = { page, limit };
  if (userId) params.userId = userId;
  if (restaurantId) params.restaurantId = restaurantId;
  if (tableId) params.tableId = tableId;
  return ordersClient.get('/reservations', { params });
};

export const getReservationById = (id) =>
  ordersClient.get(`/reservations/${id}`);

export const createReservation = (data) =>
  ordersClient.post('/reservations', data);

export const cancelReservation = (id) =>
  ordersClient.put(`/reservations/${id}/cancel`);

export default ordersClient;
