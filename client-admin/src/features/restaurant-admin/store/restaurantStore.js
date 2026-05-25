import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRestaurantStore = create(
  persist(
    (set) => ({
      selectedRestaurant: null,

      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

      clearRestaurant: () => set({ selectedRestaurant: null }),
    }),
    { name: 'foodpilot-restaurant' }
  )
);
