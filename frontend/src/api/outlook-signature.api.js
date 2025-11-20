import api from "./index.js";
import { toast } from "react-hot-toast";

/**
 * Get all signature configs for the current user
 */
export const getAllConfigs = async () => {
  try {
    const response = await api.get("/outlook-signature/configs");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch signature configurations";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get a specific signature config by ID
 */
export const getConfigById = async (id) => {
  try {
    const response = await api.get(`/outlook-signature/configs/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Create a new signature config
 */
export const createConfig = async (configData) => {
  try {
    const response = await api.post("/outlook-signature/configs", configData);
    toast.success("Signature configuration created successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to create signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update a signature config
 */
export const updateConfig = async (id, configData) => {
  try {
    const response = await api.put(`/outlook-signature/configs/${id}`, configData);
    toast.success("Signature configuration updated successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Delete a signature config
 */
export const deleteConfig = async (id) => {
  try {
    const response = await api.delete(`/outlook-signature/configs/${id}`);
    toast.success("Signature configuration deleted successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Generate HTML preview from template
 */
export const generatePreview = async (previewData) => {
  try {
    const response = await api.post("/outlook-signature/preview", previewData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to generate preview";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Generate Outlook Add-in files
 */
export const generateAddin = async (id) => {
  try {
    const response = await api.get(`/outlook-signature/generate-addin/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to generate add-in files";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Generate universal admin add-in
 */
export const generateAdminAddin = async () => {
  try {
    const response = await api.get("/outlook-signature/generate-admin-addin");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to generate admin add-in";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Get all signature configs for all users
 */
export const getAllConfigsAdmin = async () => {
  try {
    const response = await api.get("/outlook-signature/admin/configs");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch all signature configurations";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Get signature configs for a specific user
 */
export const getUserConfigsAdmin = async (userId) => {
  try {
    const response = await api.get(`/outlook-signature/admin/configs/user/${userId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user signature configurations";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Create signature config for any user
 */
export const createConfigAdmin = async (configData) => {
  try {
    const response = await api.post("/outlook-signature/admin/configs", configData);
    toast.success("Signature configuration created successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to create signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Update signature config for any user
 */
export const updateConfigAdmin = async (id, configData) => {
  try {
    const response = await api.put(`/outlook-signature/admin/configs/${id}`, configData);
    toast.success("Signature configuration updated successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Delete signature config for any user
 */
export const deleteConfigAdmin = async (id) => {
  try {
    const response = await api.delete(`/outlook-signature/admin/configs/${id}`);
    toast.success("Signature configuration deleted successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete signature configuration";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Admin: Migrate all signature templates to new format with conditional blocks
 */
export const migrateAllTemplates = async () => {
  try {
    const response = await api.post("/outlook-signature/admin/migrate-templates");
    toast.success(response.data.message || "Templates migrated successfully");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to migrate templates";
    toast.error(errorMessage);
    throw error;
  }
};

