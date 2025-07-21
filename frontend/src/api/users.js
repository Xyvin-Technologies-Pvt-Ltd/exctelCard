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
