// client-mobile/src/shared/api/eventsClient.js
// Conecta con el Event Service (Node.js, puerto 3040)
// Maneja: eventos del restaurante
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore, getRefreshToken, saveRefreshToken } from '../store/authStore.js';

const eventsClient = axios.create({
  baseURL: ENDPOINTS.EVENTS.BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

eventsClient.interceptors.request.use((config) => {
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

eventsClient.interceptors.response.use(
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
          return eventsClient(original);
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
      return eventsClient(original);
    } catch (err) {
      processQueue(err, null);
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ── Eventos ───────────────────────────────────────────────────────────────────
export const getEvents = ({ restaurantId, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (restaurantId) params.restaurantId = restaurantId;
  return eventsClient.get('/events', { params });
};

export const getEventById = (id) =>
  eventsClient.get(`/events/${id}`);

export default eventsClient;
