import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  updateTheme: (theme) =>
    set((state) => {
      if (!state.user) {
        // fail silently — UI can still switch theme locally
        return state;
      }

      return {
        user: {
          ...state.user,
          settings: {
            ...(state.user.settings ?? {}),
            theme,
          },
        },
      };
    }),
    clearUser: () => set({ user: null }),
}));
