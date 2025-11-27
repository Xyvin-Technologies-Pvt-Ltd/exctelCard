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
        console.log("🔐 Storing token and updating auth state...");
        
        try {
          login(data.user, data.token);
          
          // Verify token is stored before navigation
          const storedToken = localStorage.getItem("authToken");
          if (!storedToken || storedToken !== data.token) {
            console.error("❌ Token verification failed - token not properly stored");
            setError("Failed to store authentication token. Please try again.");
            setLoading(false);
            return;
          }

          console.log("✅ Token stored and state updated. Navigating...");
          
          // Use setTimeout to ensure state update is complete before navigation
          const targetRoute = data.user.role === "admin" ? "/admin" : "/profile";
          setTimeout(() => {
            navigate(targetRoute, { replace: true });
          }, 0);
        } catch (error) {
          console.error("❌ Error during admin login process:", error);
          setError("Failed to complete login: " + error.message);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
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
        console.log("🔐 Storing token and updating auth state...");

        // Clear the token from URL FIRST (before state update)
        window.history.replaceState({}, document.title, "/login");

        // Store token and update state - login() ensures localStorage write is complete
        try {
          login(data.user, originalToken);
          
          // Verify token is stored before navigation
          const storedToken = localStorage.getItem("authToken");
          if (!storedToken || storedToken !== originalToken) {
            console.error("❌ Token verification failed - token not properly stored");
            setError("Failed to store authentication token. Please try again.");
            setLoading(false);
            return;
          }

          console.log("✅ Token stored and state updated. Navigating to profile...");
          
          // Use setTimeout to ensure state update is complete before navigation
          // This prevents race conditions with ProtectedRoute
          setTimeout(() => {
            navigate("/profile", { replace: true });
          }, 0);
        } catch (error) {
          console.error("❌ Error during login process:", error);
          setError("Failed to complete login: " + error.message);
          setLoading(false);
        }
      } else {
        setError("Authentication failed: " + (data.message || "Unknown error"));
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("❌ Error processing token:", error);
      setError("Failed to process authentication: " + error.message);
      setLoading(false);
    },
  });
};
