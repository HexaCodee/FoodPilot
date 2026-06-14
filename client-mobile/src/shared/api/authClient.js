// client-mobile/src/shared/api/authClient.js
import axios from 'axios';
import { ENDPOINTS } from '../constants/endpoints.js';
import { useAuthStore, getRefreshToken, saveRefreshToken } from '../store/authStore.js';

// Rutas que NO deben disparar el refresh en 401
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/refresh',
  '/auth/logout',
];

const isNoRefreshPath = (url = '') =>
  NO_REFRESH_PATHS.some((p) => url.includes(p));

// ── Instancia ─────────────────────────────────────────────────────────────────
export const authClient = axios.create({
  baseURL: ENDPOINTS.AUTH.BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: adjuntar Bearer token ───────────────────────────────────────────
authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response: lógica de refresh en 401 ───────────────────────────────────────
let _isRefreshing = false;
let _queue = [];

const processQueue = (error, token = null) => {
  _queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  _queue = [];
};

authClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // No refrescar en rutas de auth ni en reintentos
    if (
      !original ||
      original._retry ||
      isNoRefreshPath(original.url ?? '') ||
      status !== 401
    ) {
      return Promise.reject(error);
    }

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _queue.push({ resolve, reject });
      })
        .then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return authClient(original);
        })
        .catch((err) => Promise.reject(err));
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
      const { data } = await authClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefresh, userDetails } = data;

      await saveRefreshToken(newRefresh ?? refreshToken);
      useAuthStore.getState().setAccessToken(accessToken, userDetails);

      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return authClient(original);
    } catch (err) {
      processQueue(err, null);
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ── API calls ─────────────────────────────────────────────────────────────────
export const login = (emailOrUsername, password) =>
  authClient.post('/auth/login', { emailOrUsername, password });

export const register = (formData) =>
  authClient.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const forgotPassword = (email) =>
  authClient.post('/auth/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  authClient.post('/auth/reset-password', { token, newPassword });

export const verifyEmail = (token) =>
  authClient.post('/auth/verify-email', { token });

// Revoca el refresh token en el servidor (best-effort, no requiere access token vigente)
export const logoutRequest = (refreshToken) =>
  authClient.post('/auth/logout', { refreshToken });

export const getMe = () =>
  authClient.get('/users/me');

export const updateProfile = (data) =>
  authClient.put('/users/me', data);

// Sube una foto de perfil desde la galería del dispositivo (multipart/form-data)
export const uploadProfilePicture = (formData) =>
  authClient.post('/users/me/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
