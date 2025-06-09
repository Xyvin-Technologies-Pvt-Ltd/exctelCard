import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log("🔍 ProtectedRoute check:", { isAuthenticated, isLoading });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log("⏳ Authentication check in progress...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("🚫 User not authenticated, redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ User authenticated, rendering protected content");
  return children;
};

export default ProtectedRoute;
