import axios from 'axios';

// ── Token handlers ────────────────────────────────────────────────────────────
// Registered from authStore after it's created, avoiding circular imports.
let _getToken = () => null;
let _getRefreshToken = () => null;
let _onLogout = () => {};
let _onTokenRefresh = () => {};

export const setAuthHandlers = ({ getToken, getRefreshToken, onLogout, onTokenRefresh }) => {
  _getToken = getToken;
  _getRefreshToken = getRefreshToken;
  _onLogout = onLogout;
  _onTokenRefresh = onTokenRefresh;
};

// ── Axios instances ───────────────────────────────────────────────────────────
const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosOrders = axios.create({
  baseURL: import.meta.env.VITE_ORDERS_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
});

const axiosEvents = axios.create({
  baseURL: import.meta.env.VITE_EVENTS_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptors (attach token) ───────────────────────────────────────
const attachToken = (clientName) => (config) => {
  config._axiosClient = clientName;
  const token = _getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

axiosAuth.interceptors.request.use(attachToken('auth'));
axiosAdmin.interceptors.request.use(attachToken('admin'));
axiosOrders.interceptors.request.use(attachToken('orders'));
axiosEvents.interceptors.request.use(attachToken('events'));

// ── Refresh-token logic ───────────────────────────────────────────────────────
let _isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

const handleRefreshToken = async (error) => {
  const original = error.config;
  if (!original || original._retry) return Promise.reject(error);

  const status = error.response?.status;
  const errorCode = error.response?.data?.error;
  const isRefresh = (original.url ?? '').includes('/auth/refresh');

  const shouldRefresh =
    (!isRefresh && status === 401) ||
    (!isRefresh && status === 403 && errorCode === 'TOKEN_EXPIRED');

  if (!shouldRefresh) return Promise.reject(error);

  const clientMap = { admin: axiosAdmin, orders: axiosOrders, events: axiosEvents };
  const retryClient = clientMap[original._axiosClient] ?? axiosAuth;

  if (_isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return retryClient(original);
      })
      .catch((err) => Promise.reject(err));
  }

  original._retry = true;
  _isRefreshing = true;

  const refreshToken = _getRefreshToken();
  if (!refreshToken) {
    _onLogout();
    return Promise.reject(error);
  }

  try {
    const response = await axiosAuth.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefresh, expiresIn, userDetails } = response.data;
    _onTokenRefresh({ accessToken, refreshToken: newRefresh, expiresIn, userDetails });
    processQueue(null, accessToken);
    original.headers.Authorization = `Bearer ${accessToken}`;
    return retryClient(original);
  } catch (err) {
    processQueue(err, null);
    _onLogout();
    return Promise.reject(err);
  } finally {
    _isRefreshing = false;
  }
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);
axiosOrders.interceptors.response.use((res) => res, handleRefreshToken);
axiosEvents.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAuth, axiosAdmin, axiosOrders, axiosEvents };
export { handleRefreshToken };
