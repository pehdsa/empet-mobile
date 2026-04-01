import { create } from "zustand";
import { secureStorage } from "@/services/storage/secure";
import type { User } from "@/types/auth";

const TOKEN_KEY = "auth_token";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrating: false,
  hasHydrated: false,

  setAuth: async (token, user) => {
    await secureStorage.set(TOKEN_KEY, token);
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: async () => {
    if (get().token === null && !get().isAuthenticated) return;
    await secureStorage.remove(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    set({ isHydrating: true });
    try {
      const token = await secureStorage.get(TOKEN_KEY);
      if (!token) return;

      set({ token });
      const { authApi } = await import("@/services/api/auth");
      const response = await authApi.getCurrentUser();
      set({ user: response.data.data, isAuthenticated: true });
    } catch {
      await get().clearAuth();
    } finally {
      set({ isHydrating: false, hasHydrated: true });
    }
  },
}));
