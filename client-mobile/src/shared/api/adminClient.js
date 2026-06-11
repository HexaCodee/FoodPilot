// client-mobile/src/shared/api/adminClient.js
// Conecta con el Restaurant Admin Service (Node.js, puerto 3020)
// Maneja: restaurantes, menús, mesas, promociones, ratings
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore, getRefreshToken, saveRefreshToken } from '../store/authStore.js';

const adminClient = axios.create({
  baseURL: ENDPOINTS.ADMIN.BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

adminClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh compartido — mismo patrón que authClient
let _isRefreshing = false;
let _queue = [];

const processQueue = (error, token = null) => {
  _queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  _queue = [];
};

adminClient.interceptors.response.use(
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
          return adminClient(original);
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
      return adminClient(original);
    } catch (err) {
      processQueue(err, null);
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ── Restaurantes ──────────────────────────────────────────────────────────────
export const getRestaurants = ({ search, isActive = true, category, page = 1, limit = 20 } = {}) => {
  const params = { page, limit, isActive };
  if (search) params.search = search;
  if (category && category !== 'all') params.category = category;
  return adminClient.get('/restaurants', { params });
};

export const getRestaurantById = (id) =>
  adminClient.get(`/restaurants/${id}`);

// ── Menús ─────────────────────────────────────────────────────────────────────
export const getMenus = ({ restaurant, category, page = 1, limit = 50 } = {}) => {
  const params = { page, limit, isAvailable: true };
  if (restaurant) params.restaurant = restaurant;
  if (category && category !== 'all') params.category = category;
  return adminClient.get('/menus', { params });
};

// ── Mesas ─────────────────────────────────────────────────────────────────────
export const getTables = ({ restaurant, limit = 100 } = {}) => {
  const params = { limit, isAvailable: true };
  if (restaurant) params.restaurant = restaurant;
  return adminClient.get('/tables', { params });
};

// ── Promociones ───────────────────────────────────────────────────────────────
// El backend (promotion.controller.js) filtra por `restaurant`, no `restaurantId`.
// Igual que la web (ClientPromotionsPage), por defecto solo se piden las activas.
export const getPromotions = ({ restaurantId, isActive = true, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (restaurantId) params.restaurant = restaurantId;
  if (isActive !== undefined) params.isActive = isActive;
  return adminClient.get('/promotions', { params });
};

// ── Valoraciones ──────────────────────────────────────────────────────────────
// El backend (rating.controller.js) filtra por `restaurant`, no `restaurantId`.
export const getRatings = ({ restaurantId, userId, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (restaurantId) params.restaurant = restaurantId;
  if (userId) params.userId = userId;
  return adminClient.get('/ratings', { params });
};

export const createRating = (data) =>
  adminClient.post('/ratings', data);

export const deleteRating = (id) =>
  adminClient.delete(`/ratings/${id}`);

export default adminClient;
