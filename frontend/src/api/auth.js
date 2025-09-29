import api from "./index";
import { toast } from "react-hot-toast";

// Initiate SSO login
export const initiateSSOLogin = async () => {
  try {
    const response = await api.get("/auth/login");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to initiate SSO login";
    toast.error(errorMessage);
    throw error;
  }
};

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await api.post("/auth/admin/login", credentials);
    toast.success("Admin login successful!");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Invalid admin credentials";
    toast.error(errorMessage);
    throw error;
  }
};

// Verify token with aggressive rate limiting protection
let lastVerifyCall = 0;
let isVerifyInProgress = false;
const VERIFY_COOLDOWN = 5000; // 5 second cooldown between verify calls

// Function to reset verification state (useful for debugging/cleanup)
export const resetVerificationState = () => {
  isVerifyInProgress = false;
  lastVerifyCall = 0;
  console.log("🔐 API: Verification state reset");
};

export const verifyToken = async (token) => {
  // Global lock: prevent any concurrent verify calls
  if (isVerifyInProgress) {
    console.warn("verifyToken already in progress, rejecting call");
    throw new Error("Verification already in progress");
  }

  // Rate limiting: prevent excessive verify calls
  const now = Date.now();
  if (now - lastVerifyCall < VERIFY_COOLDOWN) {
    console.warn(
      `verifyToken called too frequently, skipping (${
        now - lastVerifyCall
      }ms ago)`
    );
    throw new Error("Rate limited: Please wait before verifying again");
  }

  try {
    isVerifyInProgress = true;
    lastVerifyCall = now;
    console.log("🔐 API: Starting token verification");

    // Get token from parameter or localStorage
    const authToken = token || localStorage.getItem("authToken");

    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const response = await api.post(
      "/auth/verify",
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    console.log("🔐 API: Token verification successful");
    return response.data;
  } catch (error) {
    console.log("🔐 API: Token verification failed", error.message);

    // Don't show toast for rate limiting or missing token
    if (
      error.message?.includes("Rate limited") ||
      error.message?.includes("No authentication token") ||
      error.message?.includes("already in progress")
    ) {
      throw error;
    }

    const errorMessage =
      error.response?.data?.message || "Token verification failed";
    console.error("Token verification error:", errorMessage);
    throw error;
  } finally {
    isVerifyInProgress = false;
    console.log("🔐 API: Token verification completed, lock released");
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    toast.success("Logged out successfully!");
    return response.data;
  } catch (error) {
    // Don't show error toast for logout failures as user is logging out anyway
    console.error("Logout API error:", error);
    // Don't throw error to allow logout to proceed
    return { success: false, message: "Logout API call failed" };
  }
};

// Sync users
export const autoSyncUsers = async () => {
  try {
    const response = await api.post("/auth/sync/users");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to sync users";
    toast.error(errorMessage);
    throw error;
  }
};