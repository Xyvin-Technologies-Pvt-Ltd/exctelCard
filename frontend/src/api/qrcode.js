import api from "./index";
import toast from "react-hot-toast";

// Get QR code history
export const getQRHistory = async () => {
  try {
    const response = await api.get("/api/qr/history");
    return response.data;
  } catch (error) {
    console.error("Error fetching QR history:", error);
    toast.error("Failed to load QR code history");
    throw error;
  }
};

// Generate new QR code
export const generateQRCode = async (qrData) => {
  try {
    const response = await api.post("/api/qr/generate", qrData);
    toast.success("QR code generated successfully");
    return response.data;
  } catch (error) {
    console.error("Error generating QR code:", error);
    toast.error("Failed to generate QR code");
    throw error;
  }
};

// Update QR code
export const updateQRCode = async (qrId, qrData) => {
  try {
    const response = await api.put(`/api/qr/${qrId}`, qrData);
    toast.success("QR code updated successfully");
    return response.data;
  } catch (error) {
    console.error("Error updating QR code:", error);
    toast.error("Failed to update QR code");
    throw error;
  }
};

// Delete QR code
export const deleteQRCode = async (qrId) => {
  try {
    const response = await api.delete(`/api/qr/${qrId}`);
    toast.success("QR code deleted successfully");
    return response.data;
  } catch (error) {
    console.error("Error deleting QR code:", error);
    toast.error("Failed to delete QR code");
    throw error;
  }
};

// Get QR code analytics
export const getQRAnalytics = async (qrId) => {
  try {
    const response = await api.get(`/api/qr/${qrId}/analytics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching QR analytics:", error);
    toast.error("Failed to load QR code analytics");
    throw error;
  }
};
