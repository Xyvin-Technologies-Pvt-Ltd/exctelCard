import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/authStore";
import {
  useSSOMutation,
  useAdminLoginMutation,
  useTokenVerificationMutation,
} from "../hooks/useAuthMutations";
import { resetVerificationState } from "../api/auth";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { TiVendorMicrosoft } from "react-icons/ti";

export default function LoginModern() {
  const [searchParams] = useSearchParams();

  // Zustand store
  const {
    isLoading,
    error,
    isAdminMode,
    setError,
    clearError,
    toggleAdminMode,
    setAdminMode,
    reset,
  } = useAuthStore();

  // TanStack Query mutations
  const ssoMutation = useSSOMutation();
  const adminLoginMutation = useAdminLoginMutation();
  const tokenVerificationMutation = useTokenVerificationMutation();

  // Ref to prevent multiple token verification calls
  const hasProcessedToken = useRef(false);

  // React Hook Form for admin login
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
  } = useForm({
    defaultValues: {
      email: "admin@exctel.com",
      password: "admin123",
    },
    mode: "onChange",
  });

  // Check for token in URL params (from callback)
  useEffect(() => {
    // Reset verification state on component mount
    resetVerificationState();

    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("🔍 Login page loaded");
    console.log("🔍 Current URL:", window.location.href);
    console.log("🔍 URL params:", {
      token: token ? "Present (" + token.substring(0, 20) + "...)" : "None",
      error: error || "None",
    });

    if (token && !hasProcessedToken.current) {
      console.log(
        "✅ Token received from callback:",
        token.substring(0, 50) + "..."
      );
      hasProcessedToken.current = true;
      tokenVerificationMutation.mutate(token);
    } else if (error) {
      console.error("❌ Authentication error from callback:", error);
      setError(decodeURIComponent(error));
    } else {
      console.log("📝 No token or error in URL params - showing login form");
    }
  }, [searchParams]);

  // Handle SSO login
  const handleSSOLogin = () => {
    clearError();
    ssoMutation.mutate();
  };

  // Handle admin login form submission
  const onAdminSubmit = (data) => {
    adminLoginMutation.mutate(data);
  };

  // Handle mode switching
  const handleBackToUserLogin = () => {
    setAdminMode(false);
    resetForm();
    clearError();
  };

  // Loading state from any active mutation
  const isAnyLoading =
    isLoading ||
    ssoMutation.isPending ||
    adminLoginMutation.isPending ||
    tokenVerificationMutation.isPending;

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
                      disabled={isAnyLoading}
                      loading={ssoMutation.isPending}
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
                      onClick={toggleAdminMode}
                      variant="secondary"
                      className="w-full"
                      disabled={isAnyLoading}
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
                  <form
                    onSubmit={handleSubmit(onAdminSubmit)}
                    className="space-y-4"
                  >
                    <Input
                      label="Admin Email"
                      type="email"
                      placeholder="admin@exctel.com"
                      error={errors.email?.message}
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
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />

                    <Input
                      label="Admin Password"
                      type="password"
                      placeholder="Enter admin password"
                      error={errors.password?.message}
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
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />

                    <Button
                      type="submit"
                      disabled={!isValid || isAnyLoading}
                      loading={adminLoginMutation.isPending}
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
                      onClick={handleBackToUserLogin}
                      variant="secondary"
                      className="w-full"
                      disabled={isAnyLoading}
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
