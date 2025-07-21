import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useAuthStore = create(
  subscribeWithSelector((set, get) => ({
    // Authentication State
    user: null,
    isAuthenticated: false,
    token: null,

    // UI State
    isLoading: false,
    error: null,
    isAdminMode: false,

    // Initialization flag to prevent multiple init calls
    isInitialized: false,

    // Authentication Actions
    login: (userData, authToken) => {
      // Store token in localStorage
      if (authToken) {
        localStorage.setItem("authToken", authToken);
      }

      set({
        user: userData,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    },

    logout: () => {
      // Clear token from localStorage
      localStorage.removeItem("authToken");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isAdminMode: false,
        isInitialized: true,
      });
    },

    setUser: (userData) => set({ user: userData }),

    setAuthenticated: (authenticated) => {
      const currentState = get();

      // Only update if the state actually changed
      if (currentState.isAuthenticated !== authenticated) {
        set({
          isAuthenticated: authenticated,
          // If setting to false, also clear user data
          ...(authenticated === false && {
            user: null,
            token: null,
            isAdminMode: false,
          }),
        });
      }
    },

    // UI Actions
    setLoading: (loading) => {
      const currentState = get();
      // Only update if loading state changed
      if (currentState.isLoading !== loading) {
        set({ isLoading: loading });
      }
    },

    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Admin mode toggle
    toggleAdminMode: () =>
      set((state) => ({
        isAdminMode: !state.isAdminMode,
        error: null,
      })),
    setAdminMode: (mode) =>
      set({
        isAdminMode: mode,
        error: null,
      }),

    // Initialize auth state from localStorage (only once)
    initializeAuth: () => {
      const currentState = get();

      // Prevent multiple initializations
      if (currentState.isInitialized) {
        return;
      }

      const token = localStorage.getItem("authToken");
      if (token) {
        set({
          token,
          isAuthenticated: false, // Will be verified by ProtectedRoute
          isInitialized: true,
        });
      } else {
        set({
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    },

    // Reset all state
    reset: () =>
      set({
        user: null,
        isAuthenticated: false,
        token: null,
        isLoading: false,
        error: null,
        isAdminMode: false,
        isInitialized: false,
      }),
  }))
);
