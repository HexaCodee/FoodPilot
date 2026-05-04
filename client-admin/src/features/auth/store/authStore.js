import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginRequest, register as registerRequest } from '../../../shared/apis';
import { showError } from '../../../shared/utils/toast.js';

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
      // Función para validar el token y el rol del usuario
      checkAuth: () => {
        try {
          const token = get().token;
          if (!token) {
            set({ isLoadingAuth: false, isAuthenticated: false });
            return;
          }
          const role = get().user?.role;
          const isAdmin = role === 'ADMIN_ROLE';
          set({ isLoadingAuth: false, isAuthenticated: Boolean(token) && isAdmin });
        } catch {
          set({ isLoadingAuth: false, isAuthenticated: false });
        }
      },
      // Función para cerrar sesión
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },
      // Función para iniciar sesión
      login: async ({ emailOrUsername, password }) => {
        try {
          set({ loading: true, error: null });

          const { data } = await loginRequest({ emailOrUsername, password });


          // Permitir login a cualquier usuario, guardar el rol para limitar funcionalidades después

          set({
            user: data.userDetails,
            token: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresIn,
            isAuthenticated: true,
            loading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Error al iniciar sesión';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      register: async (formData) => {
        set({ loading: true, error: null });
        try {
          const res = await registerRequest(formData);
          set({ loading: false });

          if (res?.data) {
            return { success: true, data: res.data };
          }
          return { success: true };
        } catch (err) {
          set({ loading: false });
          const msg = err?.response?.data?.message || 'Error al registrar usuario';
          set({ error: msg });
          return { success: false, error: msg };
        }
      },
    }),
    { name: 'auth-KS-IN6AM' }
  )
);
