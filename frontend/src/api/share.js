import api from "./index";
import toast from "react-hot-toast";

// Get shared profile by share ID
export const getSharedProfile = async (shareId) => {
  try {
    const response = await api.get(`/share/${shareId}`);

    // Track website view when profile is loaded
    trackWebsiteView(shareId);

    return response.data;
  } catch (error) {
    console.error("Error fetching shared profile:", error);
    toast.error("Failed to load profile");
    throw error;
  }
};

// Track profile view activity
export const trackProfileView = async (shareId, metadata = {}) => {
  try {
    const response = await api.post(`/share/${shareId}/view`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewType: "profile_view",
      ...metadata,
    });
    return response.data;
  } catch (error) {
    // Don't show error toast for tracking failures
    console.error("Error tracking profile view:", error);
    // Don't throw error to avoid breaking the main functionality
  }
};

// Track website view (when someone visits the share link)
export const trackWebsiteView = async (shareId, metadata = {}) => {
  try {
    const response = await api.post(`/share/${shareId}/view`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewType: "website_view",
      url: window.location.href,
      ...metadata,
    });
    console.log("📊 Website view tracked for:", shareId);
    return response.data;
  } catch (error) {
    // Don't show error toast for tracking failures
    console.error("Error tracking website view:", error);
    // Don't throw error to avoid breaking the main functionality
  }
};

// Track download activity (when someone downloads vCard)
export const trackDownload = async (
  shareId,
  downloadType = "vcard",
  metadata = {}
) => {
  try {
    const response = await api.post(`/share/${shareId}/view`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewType: "download",
      downloadType: downloadType,
      url: window.location.href,
      ...metadata,
    });
    console.log("📥 Download tracked for:", shareId, "Type:", downloadType);
    return response.data;
  } catch (error) {
    // Don't show error toast for tracking failures
    console.error("Error tracking download:", error);
    // Don't throw error to avoid breaking the main functionality
  }
};

// Generate vCard for contact download with tracking
export const generateVCard = (profile) => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name || ""}`,
    `EMAIL:${profile.email || ""}`,
    `TEL:${profile.phone || ""}`,
    `ORG:${profile.department || ""}`,
    `TITLE:${profile.jobTitle || ""}`,
    ...(profile.linkedIn ? [`URL:${profile.linkedIn}`] : []),
    "END:VCARD",
  ].join("\n");

  return vcard;
};

// Enhanced download function with tracking
export const downloadVCard = async (profile, shareId) => {
  try {
    // Track the download before generating the file
    if (shareId) {
      await trackDownload(shareId, "vcard", {
        profileName: profile.name,
        fileName: `${
          profile.name?.toLowerCase().replace(/\s+/g, "_") || "contact"
        }.vcf`,
      });
    }

    // Generate and download the vCard
    const vcard = generateVCard(profile);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${profile.name?.toLowerCase().replace(/\s+/g, "_") || "contact"}.vcf`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Show success message
    toast.success("Contact saved successfully!");

    return true;
  } catch (error) {
    console.error("Error downloading vCard:", error);
    toast.error("Failed to download contact");
    return false;
  }
};
