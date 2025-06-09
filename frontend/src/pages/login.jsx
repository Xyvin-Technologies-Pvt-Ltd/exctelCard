import React, { useState, useEffect } from "react";
import { TiVendorMicrosoft } from "react-icons/ti";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ User already authenticated, redirecting to dashboard...");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Check for token in URL params (from callback)
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("🔍 Login page loaded");
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 URL params:", {
      token: token ? "Present (" + token.substring(0, 20) + "...)" : "None",
      error: error || "None",
    });
    console.log("🔍 All search params:", Object.fromEntries(searchParams));

    if (token) {
      console.log(
        "✅ Token received from callback:",
        token.substring(0, 50) + "..."
      );
      handleTokenReceived(token);
    } else if (error) {
      console.error("❌ Authentication error from callback:", error);
      setError(decodeURIComponent(error));
    } else {
      console.log("📝 No token or error in URL params - showing login form");
    }
  }, [searchParams]);

  const handleTokenReceived = async (token) => {
    try {
      console.log("🔐 Processing received token...");
      console.log("🔍 Token length:", token.length);
      console.log("🔍 Token starts with:", token.substring(0, 30) + "...");

      // Clear any existing errors
      setError(null);
      setIsLoading(true);

      // Verify the token with backend
      console.log("📡 Sending verification request to backend...");
      const response = await fetch("http://localhost:5000/api/auth/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Backend response status:", response.status);
      const data = await response.json();
      console.log("🔍 Token verification response:", data);

      if (data.success && data.user) {
        console.log("✅ User authenticated successfully:", data.user);

        // Use AuthContext login function
        login(data.user, token);
        console.log("💾 Token stored via AuthContext");
        console.log("🚀 Redirecting to dashboard...");

        // Clear the token from URL
        window.history.replaceState({}, document.title, "/login");
        navigate("/dashboard");
      } else {
        console.error("❌ Token verification failed:", data.message);
        setError("Authentication failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error processing token:", error);
      setError("Failed to process authentication: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Initiating SSO login...");

      // Call backend to get Azure AD auth URL
      const response = await fetch("http://localhost:5000/api/auth/login");
      const data = await response.json();

      console.log("🔍 Backend response:", data);

      if (data.success && data.authUrl) {
        console.log("✅ Auth URL received:", data.authUrl);
        console.log("🚀 Redirecting to Azure AD...");

        // Redirect to Azure AD
        window.location.href = data.authUrl;
      } else {
        console.error("❌ Failed to get auth URL:", data.message);
        setError(data.message || "Failed to initiate login");
      }
    } catch (error) {
      console.error("❌ SSO login error:", error);
      setError("Network error. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = () => {
    console.log("🔍 Password login attempted (not implemented)");
    setError("Password login is not implemented. Please use SSO.");
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Branding Section */}
      <div className="relative w-1/2 bg-black overflow-hidden flex items-center justify-center">
        {/* Polygon Background */}
        <div
          className="absolute h-full w-full bg-gray-800"
          style={{
            clipPath:
              "polygon(-10% 0%, 40% 0%, 80% 50%, 40% 100%, -5% 100%, 40% 50%)",
          }}
        ></div>

        {/* Logo Text */}
        <h1 className="text-6xl font-bold z-10 text-white flex items-center">
          <span className="text-white">ex</span>
          <span className="text-orange-500">ctel.</span>
        </h1>
      </div>

      {/* Right Login Section */}
      <div className="w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mini logo and label */}
          <div className="flex items-center space-x-2 mb-12">
            <img src="/Group 1.png" alt="Logo Icon" className="w-6 h-6" />
            <img src="/Group 2.svg" alt="Logo Text" className="h-6" />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Login</h3>
              <p className="text-gray-500">
                Welcome back! Please enter your details.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleSSOLogin}
                disabled={isLoading}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <TiVendorMicrosoft className="text-xl" />
                    Sign in with SSO
                  </>
                )}
              </button>

              <button
                onClick={handlePasswordLogin}
                className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
              >
                Sign in with password
              </button>
            </div>

            <div className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <a
                href="#"
                className="text-orange-500 hover:text-orange-600 font-medium"
              >
                Sign up for free
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
