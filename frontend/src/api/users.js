import api from "./index.js";
import { toast } from "react-hot-toast";

export const getUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    console.log(response.data);
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

/**
 * Get all users from Entra ID (Admin only)
 * @param {string} searchQuery - Optional search query to filter users
 * @param {string} skipToken - Optional pagination token
 */
export const getAllEntraUsers = async (searchQuery = "", skipToken = null) => {
  try {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append("search", searchQuery);
    }
    if (skipToken) {
      params.append("skipToken", skipToken);
    }

    const queryString = params.toString();
    const url = `/auth/admin/entra-users/all${queryString ? `?${queryString}` : ""}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch Entra ID users";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Assign users to Enterprise Application (Admin only)
 * @param {string[]} userIds - Array of user principal IDs to assign
 */
export const assignUsersToApp = async (userIds) => {
  try {
    const response = await api.post("/auth/admin/entra-users/assign", {
      userIds,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to assign users";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Remove users from Enterprise Application and local database (Admin only)
 * @param {string[]} userIds - Array of user principal IDs to remove
 */
export const removeUsersFromApp = async (userIds) => {
  try {
    const response = await api.post("/auth/admin/entra-users/remove", {
      userIds,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to remove users";
    toast.error(errorMessage);
    throw error;
  }
};
