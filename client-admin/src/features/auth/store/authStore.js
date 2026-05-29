import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { axiosAuth, setAuthHandlers } from '../../../shared/apis/api.js';
import { useRestaurantStore } from '../../restaurant-admin/store/restaurantStore.js';

const VALID_ROLES = ['CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'];

const getDashboardPath = (role) => {
  if (role === 'PLATFORM_ADMIN') return '/dashboard/admin';
  if (role === 'RESTAURANT_ADMIN') return '/dashboard/restaurant';
  return '/dashboard/client';
};

// Raw API calls — defined here to avoid circular imports
const loginRequest = (data) => axiosAuth.post('/auth/login', data);
const registerRequest = (data) =>
  axiosAuth.post('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      loading: false,
      error: null,
      isLoadingAuth: true,
      isAuthenticated: false,

      checkAuth: () => {
        try {
          const token = get().token;
          if (!token) {
            set({ isLoadingAuth: false, isAuthenticated: false });
            return;
          }
          const role = get().user?.role;
          const valid = Boolean(token) && VALID_ROLES.includes(role);
          set({ isLoadingAuth: false, isAuthenticated: valid });
        } catch {
          set({ isLoadingAuth: false, isAuthenticated: false });
        }
      },

      getDashboardPath: () => getDashboardPath(get().user?.role),

      logout: () => {
        // Clear restaurant selection so it never leaks into a different user's session
        const { clearRestaurant, setAssignedCount } = useRestaurantStore.getState();
        clearRestaurant();
        setAssignedCount(0);

        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });
          const { data } = await loginRequest({ emailOrUsername, password });
          set({
            user: data.userDetails,
            token: data.token,
            refreshToken: null,
            expiresAt: data.expiresAt,
            isAuthenticated: true,
            loading: false,
          });
          return { success: true, dashboardPath: getDashboardPath(data.userDetails?.role) };
        } catch (err) {
          const message = err.response?.data?.message || 'Credenciales inválidas';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      register: async (formData) => {
        set({ loading: true, error: null });
        try {
          const res = await registerRequest(formData);
          set({ loading: false });
          if (res?.data) return { success: true, data: res.data };
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const msg = err?.response?.data?.message || 'Error al registrar usuario';
          set({ error: msg });
          return { success: false, error: msg };
        }
      },
    }),
    { name: 'foodpilot-auth' }
  )
);

// ── Register token handlers with axios (no circular import) ───────────────────
setAuthHandlers({
  getToken: () => useAuthStore.getState().token,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onLogout: () => useAuthStore.getState().logout(),
  onTokenRefresh: ({ accessToken, refreshToken, expiresIn, userDetails }) => {
    useAuthStore.setState({
      token: accessToken,
      refreshToken: refreshToken,
      expiresAt: expiresIn,
      user: userDetails ?? useAuthStore.getState().user,
      isAuthenticated: true,
    });
  },
});
