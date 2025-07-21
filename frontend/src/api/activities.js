import api from "./index";
import { toast } from "react-hot-toast";

// Get all activities with optional filters
export const getActivities = async (filters = {}) => {
  try {
    const { type, timeRange } = filters;
    let url = "/activities";

    // Add query parameters if filters are provided
    const params = new URLSearchParams();
    if (type && type !== "all") params.append("type", type);
    if (timeRange && timeRange !== "all") params.append("timeRange", timeRange);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch activities";
    toast.error(errorMessage);
    throw error;
  }
};

// Get activity statistics
export const getActivityStats = async () => {
  try {
    const response = await api.get("/activities/stats");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch activity statistics";
    toast.error(errorMessage);
    throw error;
  }
};

// Get user-specific activity
export const getUserActivity = async (userId) => {
  try {
    const response = await api.get(`/activities/user/${userId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user activity";
    toast.error(errorMessage);
    throw error;
  }
};
