import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Profile from "./pages/Profile";
import QRCode from "./pages/QRCode";
import Layout from "./layout/LayoutModern";
import Login from "./pages/LoginModern";
import "./App.css";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";
import ShareView from "./pages/ShareView";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";
import { useAuthStore } from "./store/authStore";

// Create a client with optimized settings for rate limiting prevention
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching to reduce API calls
      staleTime: 10 * 60 * 1000, // 10 minutes - data considered fresh
      cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache

      // Reduce automatic refetching
      refetchOnWindowFocus: false, // Don't refetch when window gets focus
      refetchOnMount: false, // Don't refetch on component mount if data exists
      refetchOnReconnect: false, // Don't refetch on network reconnect

      // Conservative retry policy
      retry: 1, // Only retry once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

      // Error handling
      useErrorBoundary: false, // Handle errors in components
    },
    mutations: {
      // Conservative retry for mutations
      retry: 1,
      retryDelay: 2000, // 2 second delay

      // Error handling
      useErrorBoundary: false,

      // Network error handling
      networkMode: "online", // Only run when online
    },
  },
});

// Add global error handling
queryClient.getQueryCache().config.onError = (error, query) => {
  console.warn(`Query error [${query.queryKey.join(", ")}]:`, error.message);

  // Check for rate limiting
  if (error.response?.status === 429) {
    console.warn("Rate limit detected - backing off requests");
    // Could implement exponential backoff here
  }
};

queryClient.getMutationCache().config.onError = (
  error,
  variables,
  context,
  mutation
) => {
  console.warn("Mutation error:", error.message);

  if (error.response?.status === 429) {
    console.warn("Rate limit detected on mutation - backing off requests");
  }
};

function App() {
  const { initializeAuth } = useAuthStore();

  // Initialize auth state on app startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <main>
                  <Login />
                </main>
              }
            />
            <Route
              path="/share/:id"
              element={
                <main>
                  <ShareView />
                </main>
              }
            />

            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/profile" element={<Profile />} />
                      <Route
                        path="/"
                        element={<Navigate to="/profile" replace />}
                      />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/qrcode" element={<QRCode />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        <ToastProvider />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
