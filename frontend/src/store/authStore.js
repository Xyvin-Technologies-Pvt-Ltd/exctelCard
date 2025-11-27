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
      // Store token in localStorage FIRST (synchronously)
      if (authToken) {
        try {
          localStorage.setItem("authToken", authToken);
          // Verify the write was successful
          const storedToken = localStorage.getItem("authToken");
          if (storedToken !== authToken) {
            console.error("❌ Failed to store token in localStorage");
            throw new Error("Failed to store authentication token");
          }
          console.log("✅ Token stored in localStorage successfully");
        } catch (error) {
          console.error("❌ Error storing token:", error);
          throw error;
        }
      }

      // Update state synchronously - ensure isInitialized is set immediately
      set({
        user: userData,
        token: authToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });

      console.log("✅ Auth state updated - user:", userData?.email, "authenticated:", true);
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
          isAuthenticated: true, // Optimistically authenticate - will be verified by ProtectedRoute
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
