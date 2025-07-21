import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { initiateSSOLogin, adminLogin, verifyToken } from "../api/auth";

export const useSSOMutation = () => {
  const { setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: initiateSSOLogin,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      if (data.success && data.authUrl) {
        console.log("✅ Auth URL received:", data.authUrl);
        window.location.href = data.authUrl;
      }
    },
    onError: (error) => {
      console.error("❌ SSO login error:", error);
      setError("Network error. Please check if the backend is running.");
      setLoading(false);
    },
  });
};

export const useAdminLoginMutation = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: adminLogin,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      if (data.success && data.token && data.user) {
        console.log("✅ Admin authenticated successfully:", data.user);
        login(data.user, data.token);
        navigate(data.user.role === "admin" ? "/admin" : "/profile");
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error("❌ Admin login error:", error);
      setError(error.response?.data?.message || "Invalid admin credentials");
      setLoading(false);
    },
  });
};

export const useTokenVerificationMutation = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError } = useAuthStore();

  return useMutation({
    mutationFn: verifyToken,
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, variables) => {
      // variables contains the original token that was passed to verifyToken
      const originalToken = variables;

      if (data.success && data.user) {
        console.log("✅ User authenticated successfully:", data.user);
        console.log("✅ Storing token for future API calls");

        // Use the original token that was verified
        login(data.user, originalToken);

        // Clear the token from URL
        window.history.replaceState({}, document.title, "/login");
        navigate("/profile");
      } else {
        setError("Authentication failed: " + (data.message || "Unknown error"));
      }
      setLoading(false);
    },
    onError: (error) => {
      console.error("❌ Error processing token:", error);
      setError("Failed to process authentication: " + error.message);
      setLoading(false);
    },
  });
};
