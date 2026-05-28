import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRestaurantStore = create(
  persist(
    (set) => ({
      selectedRestaurant: null,
      assignedCount: 0,

      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),

      clearRestaurant: () => set({ selectedRestaurant: null }),

      setAssignedCount: (count) => set({ assignedCount: count }),
    }),
    { name: 'foodpilot-restaurant' }
  )
);
