import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { TiVendorMicrosoft } from "react-icons/ti";

export default function LoginModern() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Admin login state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: "",
  });

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔄 Initiating Admin login...");

      // Call backend admin login endpoint
      const response = await fetch(
        "http://localhost:5000/api/auth/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(adminCredentials),
        }
      );

      const data = await response.json();
      console.log("🔍 Admin login response:", data);

      if (data.success && data.token && data.user) {
        console.log("✅ Admin authenticated successfully:", data.user);

        // Use AuthContext login function
        login(data.user, data.token);
        console.log("💾 Admin token stored via AuthContext");
        console.log("🚀 Redirecting to admin dashboard...");

        // Redirect to admin dashboard or regular dashboard
        navigate(
          data.user.role === "admin" ? "/admin/dashboard" : "/dashboard"
        );
      } else {
        console.error("❌ Admin login failed:", data.message);
        setError(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      console.error("❌ Admin login error:", error);
      setError("Network error. Please check if the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex">
      {/* Left Branding Section - Modern Design */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20"></div>
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
          >
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
              <span className="text-white">ex</span>
              <span className="text-orange-500">ctel</span>
              <span className="text-white">.</span>
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Digital Business Cards
            </p>
          </div>

          <div className="max-w-md space-y-6 text-gray-300">
            <h2 className="text-2xl font-semibold text-white">
              Welcome to the Future of Networking
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Create, share, and manage your professional digital business
              cards. Connect with people instantly and track your networking
              success.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-300">
                  Instant Sharing
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-300">
                  Real-time Analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Section - Modern Design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="text-gray-900">ex</span>
              <span className="text-orange-500">ctel</span>
              <span className="text-gray-900">.</span>
            </h1>
          </div>

          <Card padding="lg" className="shadow-xl border-0">
            <Card.Header>
              <Card.Title className="text-center text-2xl">
                {isAdminMode ? "Admin Access" : "Welcome back"}
              </Card.Title>
              <Card.Description className="text-center">
                {isAdminMode
                  ? "Super Admin login to manage all users and system"
                  : "Sign in to access your digital business card dashboard"}
              </Card.Description>
            </Card.Header>

            <Card.Content>
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Authentication Error
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {!isAdminMode ? (
                  // Regular User Login (Microsoft SSO)
                  <>
                    <Button
                      onClick={handleSSOLogin}
                      disabled={isLoading}
                      loading={isLoading}
                      className="w-full h-12 text-base"
                      icon={<TiVendorMicrosoft className="text-xl" />}
                    >
                      Continue with Microsoft
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsAdminMode(true)}
                      variant="secondary"
                      className="w-full"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Admin Access
                    </Button>
                  </>
                ) : (
                  // Admin Login Form
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <Input
                      label="Admin Email"
                      name="email"
                      type="email"
                      value={adminCredentials.email}
                      onChange={handleAdminInputChange}
                      placeholder="admin@exctel.com"
                      required
                      startIcon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                      }
                    />

                    <Input
                      label="Admin Password"
                      name="password"
                      type="password"
                      value={adminCredentials.password}
                      onChange={handleAdminInputChange}
                      placeholder="Enter admin password"
                      required
                      startIcon={
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      }
                    />

                    <Button
                      type="submit"
                      disabled={
                        isLoading ||
                        !adminCredentials.email ||
                        !adminCredentials.password
                      }
                      loading={isLoading}
                      className="w-full h-12"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      Sign in as Admin
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        setIsAdminMode(false);
                        setAdminCredentials({ email: "", password: "" });
                        setError(null);
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      ← Back to User Login
                    </Button>
                  </form>
                )}
              </div>
            </Card.Content>

            <Card.Footer className="pt-6 border-t-0 justify-center">
              <p className="text-sm text-gray-600">
                {isAdminMode ? (
                  <>
                    Need help with admin access?{" "}
                    <a
                      href="#"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Contact system administrator
                    </a>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <a
                      href="#"
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Contact your administrator
                    </a>
                  </>
                )}
              </p>
            </Card.Footer>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2025 ExctelCard. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-gray-700">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gray-700">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-700">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
