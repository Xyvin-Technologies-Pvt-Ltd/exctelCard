import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/auth";

// Layout components
import Layout from "./layout/Layout";

// Page components
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Activity from "./pages/Activity";
import QRCode from "./pages/QRCode";
import ShareView from "./pages/ShareView";

// Card components
import DigitalCard from "./components/DigitalCard";
import AuthCallback from "./components/AuthCallback";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, hasAnyRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Auth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Digital card public route */}
            <Route
              path="/card/:companySlug/:userId"
              element={<DigitalCard />}
            />

            {/* Protected routes with layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/qr-code" element={<QRCode />} />
                      <Route path="/share" element={<ShareView />} />

                      {/* Admin routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute
                            requiredRoles={["admin", "super_admin"]}
                          >
                            <Admin />
                          </ProtectedRoute>
                        }
                      />

                      {/* Default redirect */}
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
