import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/auth";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleSSOCallback } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const userData = searchParams.get("user");
      const error = searchParams.get("error");

      if (error) {
        console.error("SSO Authentication failed:", error);
        navigate("/login?error=" + encodeURIComponent("Authentication failed"));
        return;
      }

      if (token) {
        try {
          const result = await handleSSOCallback(token, userData);

          if (result.success) {
            navigate("/dashboard");
          } else {
            navigate(
              "/login?error=" + encodeURIComponent("Authentication failed")
            );
          }
        } catch (error) {
          console.error("SSO callback error:", error);
          navigate(
            "/login?error=" + encodeURIComponent("Authentication failed")
          );
        }
      } else {
        navigate(
          "/login?error=" +
            encodeURIComponent("No authentication token received")
        );
      }
    };

    handleCallback();
  }, [searchParams, handleSSOCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing sign in...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
