// client-mobile/src/shared/store/notificationStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferencias de notificaciones del usuario, persistidas en el dispositivo
export const useNotificationStore = create(
  persist(
    (set, get) => ({
      orderUpdates: true,
      promotions: true,
      reservationReminders: true,

      setPreference: (key, value) => set({ [key]: value }),

      getPreferences: () => {
        const { orderUpdates, promotions, reservationReminders } = get();
        return { orderUpdates, promotions, reservationReminders };
      },
    }),
    {
      name: 'fp-notification-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
