import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log("🔍 Checking authentication status...");
      console.log("📊 LocalStorage contents:", {
        authToken: localStorage.getItem("authToken") ? "Present" : "None",
        keys: Object.keys(localStorage),
      });

      const token = localStorage.getItem("authToken");

      if (!token) {
        console.log("📝 No token found in localStorage");
        setIsLoading(false);
        return;
      }

      console.log("🔐 Token found, verifying with backend...");
      console.log("🔍 Token preview:", token.substring(0, 30) + "...");

      // Verify token with backend
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("🔍 Auth verification response:", data);

      if (data.success && data.user) {
        console.log("✅ User is authenticated:", data.user);
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        console.log("❌ Token invalid, removing from storage");
        localStorage.removeItem("authToken");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData, token) => {
    console.log("🔐 User logged in:", userData);
    console.log("💾 Storing token in localStorage...");
    console.log("🔍 Token to store:", token.substring(0, 30) + "...");

    localStorage.setItem("authToken", token);

    // Verify it was stored
    const storedToken = localStorage.getItem("authToken");
    console.log("✅ Token stored successfully:", storedToken ? "Yes" : "No");

    setUser(userData);
    setIsAuthenticated(true);

    console.log("🎯 Auth state updated - user authenticated");
  };

  const logout = async () => {
    try {
      console.log("🔄 Logging out user...");
      const token = localStorage.getItem("authToken");

      if (token) {
        // Call backend logout endpoint
        const response = await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("🔍 Logout response:", data);

        if (data.success && data.logoutUrl) {
          console.log("🚀 Redirecting to Azure AD logout...");
          window.location.href = data.logoutUrl;
          return;
        }
      }

      // Fallback: local logout
      console.log("📝 Performing local logout...");
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Fallback: local logout
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
