import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { BRAND, COLORS } from "../utils/constants";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const { login, loginWithGoogle, loginWithMicrosoft, isLoading } =
    useAuthStore();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      if (!result.success) {
        setError(result.error || "Login failed");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    }
  };

  const handleGoogleLogin = () => {
    setError("");
    loginWithGoogle();
  };

  const handleMicrosoftLogin = () => {
    setError("");
    loginWithMicrosoft();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center items-start px-16 text-white">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-white">{BRAND.logo.highlight}</span>
              <span className="text-orange-200">{BRAND.logo.accent}</span>
            </h1>
            <p className="text-xl text-orange-100 mt-4 font-light">
              {BRAND.tagline}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-6v6"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Digital Business Cards
                </h3>
                <p className="text-orange-100/80">
                  Create and share your professional presence
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                <p className="text-orange-100/80">
                  Track views, downloads, and engagement
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Seamless Sharing</h3>
                <p className="text-orange-100/80">
                  QR codes, vCards, and direct links
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-gray-900">{BRAND.logo.highlight}</span>
              <span className="text-orange-500">{BRAND.logo.accent}</span>
            </h1>
          </div>

          <div className="bg-white py-10 px-8 shadow-xl rounded-2xl border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isAdminLogin ? "Admin Access" : "Welcome Back"}
              </h2>
              <p className="text-gray-600">
                {isAdminLogin
                  ? "Sign in to manage your organization"
                  : "Access your digital business card dashboard"}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {!isAdminLogin ? (
              <div className="space-y-4">
                {/* Microsoft SSO - Primary */}
                <Button
                  onClick={handleMicrosoftLogin}
                  className="w-full h-14 flex items-center justify-center px-6 py-4 bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  <svg
                    className="w-6 h-6 mr-4"
                    viewBox="0 0 23 23"
                    fill="currentColor"
                  >
                    <path d="M1 1h10v10H1zM12 1h10v10H12zM1 12h10v10H1zM12 12h10v10H12z" />
                  </svg>
                  {isLoading ? "Connecting..." : "Continue with Microsoft"}
                </Button>

                {/* Google SSO - Secondary */}
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full h-14 flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      or
                    </span>
                  </div>
                </div>

                {/* Admin Login Link */}
                <Button
                  onClick={() => setIsAdminLogin(true)}
                  variant="outline"
                  className="w-full h-12 text-gray-600 border-gray-300 hover:border-orange-300 hover:text-orange-600 rounded-xl font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Admin Access
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="admin@exctel.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign in to Admin Panel"
                    )}
                  </Button>
                </div>

                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsAdminLogin(false)}
                    className="text-sm text-gray-500 hover:text-orange-600 font-medium"
                  >
                    ← Back to employee login
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure authentication powered by{" "}
              <span className="font-semibold text-orange-600">Exctel</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
