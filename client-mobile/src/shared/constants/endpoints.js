// client-mobile/src/shared/constants/endpoints.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const env = Constants.expoConfig?.extra ?? {};

// ── Host de desarrollo ──────────────────────────────────────────────────────
// En un emulador/navegador, "localhost" apunta a la propia PC y todo funciona.
// Pero en un TELÉFONO FÍSICO conectado por Expo Go, "localhost" apunta al
// teléfono, no a la PC que corre los 4 microservicios — por lo que cualquier
// petición (login incluido) falla por red, y ese error de red termina
// mostrándose como "credenciales inválidas" (ver useAuth.js).
//
// Para que funcione "out of the box" en el teléfono, derivamos la IP LAN de
// la propia PC a partir del host con el que Expo Go se conectó al bundler
// (Constants.expoConfig.hostUri tiene la forma "192.168.1.5:8081").
// Esto requiere que el teléfono y la PC estén en la misma red Wi-Fi y que los
// backends escuchen en 0.0.0.0 (los 3 servicios Node ya lo hacen; el
// Authentication-service .NET debe configurarse con applicationUrl
// "http://0.0.0.0:5126" en su launchSettings.json para aceptar conexiones LAN).
const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? '';
const lanHost = hostUri.split(':')[0];
const DEV_HOST = Platform.OS === 'web' || !lanHost ? 'localhost' : lanHost;

// Servicio de autenticación — .NET / puerto 5126
const AUTH_BASE =
  process.env.EXPO_PUBLIC_AUTH_URL ??
  env.authUrl ??
  `http://${DEV_HOST}:5126/api/v1`;

// Servicio de restaurantes, menús, mesas, inventario — Node.js / puerto 3020
const ADMIN_BASE =
  process.env.EXPO_PUBLIC_ADMIN_URL ??
  env.adminUrl ??
  `http://${DEV_HOST}:3020/restaurantAdmin/v1`;

// Servicio de pedidos y reservas — Node.js / puerto 3030
const ORDERS_BASE =
  process.env.EXPO_PUBLIC_ORDERS_URL ??
  env.ordersUrl ??
  `http://${DEV_HOST}:3030/api`;

// Servicio de eventos, reportes y estadísticas — Node.js / puerto 3040
const EVENTS_BASE =
  process.env.EXPO_PUBLIC_EVENTS_URL ??
  env.eventsUrl ??
  `http://${DEV_HOST}:3040/eventService/v1`;

export const ENDPOINTS = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    BASE: AUTH_BASE,
    LOGIN: `${AUTH_BASE}/auth/login`,
    REGISTER: `${AUTH_BASE}/auth/register`,
    LOGOUT: `${AUTH_BASE}/auth/logout`,
    REFRESH: `${AUTH_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${AUTH_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${AUTH_BASE}/auth/reset-password`,
    VERIFY_EMAIL: `${AUTH_BASE}/auth/verify-email`,
    ME: `${AUTH_BASE}/users/me`,
    ME_PROFILE_PICTURE: `${AUTH_BASE}/users/me/profile-picture`,
  },

  // ── Restaurant Admin ──────────────────────────────────────────────────────
  ADMIN: {
    BASE: ADMIN_BASE,
    RESTAURANTS: `${ADMIN_BASE}/restaurants`,
    MENUS: `${ADMIN_BASE}/menus`,
    TABLES: `${ADMIN_BASE}/tables`,
    PROMOTIONS: `${ADMIN_BASE}/promotions`,
    RATINGS: `${ADMIN_BASE}/ratings`,
  },

  // ── Orders & Reservations ─────────────────────────────────────────────────
  ORDERS: {
    BASE: ORDERS_BASE,
    ORDERS: `${ORDERS_BASE}/orders`,
    RESERVATIONS: `${ORDERS_BASE}/reservations`,
  },

  // ── Events ────────────────────────────────────────────────────────────────
  EVENTS: {
    BASE: EVENTS_BASE,
    EVENTS: `${EVENTS_BASE}/events`,
    SALES_REPORTS: `${EVENTS_BASE}/sales-reports`,
    USAGE_STATS: `${EVENTS_BASE}/usage-stats`,
  },
};
