import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { verifyToken } from "../api/auth";
import LoadingSpinner from "../ui/LoadingSpinner";

const DEBUG_AUTH = false; // Set to true for debugging

// Global lock to prevent multiple ProtectedRoute instances from verifying simultaneously
let globalVerificationLock = false;

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    user,
    token,
    setLoading,
    setUser,
    setAuthenticated,
  } = useAuthStore();

  // Use ref to prevent multiple simultaneous verification calls
  const isVerifying = useRef(false);
  const hasVerified = useRef(false);
  const componentId = useRef(Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const checkAuth = async () => {
      if (DEBUG_AUTH)
        console.log(
          `🔐 ProtectedRoute[${componentId.current}]: Starting auth check`
        );

      // Don't verify if we're on login page with token - LoginModern handles that
      const isLoginPageWithToken =
        location.pathname === "/login" &&
        new URLSearchParams(location.search).has("token");

      if (isLoginPageWithToken) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: On login page with token, skipping verification`
          );
        return;
      }

      // Global lock check
      if (globalVerificationLock) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Global verification in progress, skipping`
          );
        return;
      }

      // Get current token from localStorage
      const storedToken = localStorage.getItem("authToken");

      // If no token, user is not authenticated
      if (!storedToken) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: No token found`
          );
        setAuthenticated(false);
        setLoading(false);
        hasVerified.current = true;
        return;
      }

      // If already verifying, don't start another verification
      if (isVerifying.current) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Already verifying, skipping`
          );
        return;
      }

      // If already verified and have user data, don't verify again
      if (hasVerified.current && user && isAuthenticated) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Already verified and authenticated`
          );
        return;
      }

      try {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Starting token verification`
          );

        // Set both local and global locks
        isVerifying.current = true;
        globalVerificationLock = true;
        setLoading(true);

        const response = await verifyToken();

        if (response.success && response.user) {
          if (DEBUG_AUTH)
            console.log(
              `🔐 ProtectedRoute[${componentId.current}]: Verification successful`,
              response.user.email
            );
          setUser(response.user);
          setAuthenticated(true);
          hasVerified.current = true;
        } else {
          if (DEBUG_AUTH)
            console.log(
              `🔐 ProtectedRoute[${componentId.current}]: Verification failed - invalid token`
            );
          // Token is invalid
          localStorage.removeItem("authToken");
          setAuthenticated(false);
          hasVerified.current = true;
        }
      } catch (error) {
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Verification error`,
            error.message
          );

        // Don't treat rate limiting as a real error
        if (
          error.message?.includes("Rate limited") ||
          error.message?.includes("already in progress")
        ) {
          if (DEBUG_AUTH)
            console.log(
              `🔐 ProtectedRoute[${componentId.current}]: Rate limited or concurrent call, will retry later`
            );
          return; // Don't mark as failed, just skip this attempt
        }

        console.error("Auth verification failed:", error);
        localStorage.removeItem("authToken");
        setAuthenticated(false);
        hasVerified.current = true;
      } finally {
        setLoading(false);
        isVerifying.current = false;
        globalVerificationLock = false;
        if (DEBUG_AUTH)
          console.log(
            `🔐 ProtectedRoute[${componentId.current}]: Auth check completed`
          );
      }
    };

    checkAuth();
  }, [location.pathname, location.search]); // Add location dependencies to re-check when route changes

  // Show loading spinner while checking authentication
  if (isLoading || isVerifying.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (DEBUG_AUTH)
      console.log(
        `🔐 ProtectedRoute[${componentId.current}]: Not authenticated, redirecting to login`
      );
    return <Navigate to="/login" replace />;
  }

  if (DEBUG_AUTH)
    console.log(
      `🔐 ProtectedRoute[${componentId.current}]: Authenticated, rendering children`
    );
  return children;
};

export default ProtectedRoute;
