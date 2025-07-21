import api from "./index.js";
import { toast } from "react-hot-toast";

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch profile";
    toast.error(errorMessage);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (data) => {
  try {
    const response = await api.put("/profile", data);
    toast.success("Profile updated successfully!");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update profile";
    toast.error(errorMessage);
    throw error;
  }
};

// Generate share ID
export const generateShareId = async () => {
  try {
    const response = await api.post("/profile/share-id");
    toast.success("Share link generated successfully!");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to generate share link";
    toast.error(errorMessage);
    throw error;
  }
};

// Sync profile with SSO data
export const syncProfile = async () => {
  try {
    const response = await api.post("/profile/sync");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to sync profile";
    toast.error(errorMessage);
    throw error;
  }
};
