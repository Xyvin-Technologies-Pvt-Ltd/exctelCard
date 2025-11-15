import api from "./index.js";
import { toast } from "react-hot-toast";

export const getUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch users";
    toast.error(errorMessage);
    throw error;
  }
};

export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/activity`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user activity";
    toast.error(errorMessage);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/admin/users/search?q=${query}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to search users";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async () => {
  try {
    const response = await api.get("/profile/preferences");
    return response.data;
  } catch (error) {
    // If endpoint doesn't exist, return empty preferences
    if (error.response?.status === 404) {
      return { success: true, data: {} };
    }
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user preferences";
    console.warn(errorMessage);
    return { success: true, data: {} };
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await api.put("/profile/preferences", preferences);
    toast.success("Preferences updated successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update preferences";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get user profile from Microsoft Graph API (Admin only)
 */
export const getUserProfileFromGraphAdmin = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}/profile-from-graph`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user profile from Graph API";
    // Don't show toast for this - let the component handle it
    console.error(errorMessage);
    throw error;
  }
};
