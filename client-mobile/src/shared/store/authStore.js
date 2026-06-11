// client-mobile/src/shared/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const REFRESH_KEY = 'fp_refresh_token';

// ── SecureStore helpers ───────────────────────────────────────────────────────
export const saveRefreshToken = async (token) => {
  try {
    if (token) await SecureStore.setItemAsync(REFRESH_KEY, token);
    else await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // SecureStore no disponible en web — ignorar silenciosamente
  }
};

export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
};

export const deleteRefreshToken = async () => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch {
    // ignorar
  }
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── Estado ──────────────────────────────────────────────────────────────
      token: null,
      user: null,           // { id, username, profilePicture, role }
      expiresAt: null,
      isAuthenticated: false,
      _hasHydrated: false,

      // ── Login ────────────────────────────────────────────────────────────────
      // Llamado con los datos que devuelve el backend:
      // { token, userDetails: { id, username, profilePicture, role }, expiresAt, refreshToken? }
      login: async (accessToken, userDetails, refreshToken = null) => {
        await saveRefreshToken(refreshToken);
        set({
          token: accessToken,
          user: userDetails,
          expiresAt: null,
          isAuthenticated: true,
        });
      },

      // ── Logout ───────────────────────────────────────────────────────────────
      logout: async () => {
        await deleteRefreshToken();
        set({
          token: null,
          user: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      // ── Actualizar solo el access token (tras refresh) ────────────────────────
      setAccessToken: (accessToken, userDetails = null) => {
        set((prev) => ({
          token: accessToken,
          user: userDetails ?? prev.user,
        }));
      },

      // ── Actualizar datos del usuario (perfil) ─────────────────────────────────
      updateUser: (partial) => {
        set((prev) => ({
          user: prev.user ? { ...prev.user, ...partial } : prev.user,
        }));
      },

      // ── Getters ───────────────────────────────────────────────────────────────
      getToken: () => get().token,
      getUser: () => get().user,
    }),
    {
      name: 'fp-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Solo persistir token y user — isAuthenticated se deriva al hidratar
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    }
  )
);
