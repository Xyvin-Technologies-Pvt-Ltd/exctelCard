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
  downloadType = "vcardDownloads",
  metadata = {}
) => {
  try {
    console.log("📥 Download tracked for:", shareId, "Type:", downloadType, "Metadata:", metadata);
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
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name || ""}`,
    `N:${(profile.name || "").split(" ").slice(-1)};${(profile.name || "").split(0, -1).join(" ")};;;`,
    ...(profile.email ? [`EMAIL;TYPE=INTERNET:${profile.email}`] : []),
    ...(profile.phone ? [`TEL;TYPE=CELL:${profile.phone}`] : []),
    ...(profile.department ? [`ORG:${profile.department}`] : []),
    ...(profile.jobTitle ? [`TITLE:${profile.jobTitle}`] : []),
    ...(profile.linkedIn ? [`URL:${profile.linkedIn}`] : []),
    "END:VCARD",
  ];
  return lines.join("\n");
};

// Enhanced download function with tracking
export const downloadVCard = async (profile, shareId) => {
  try {
    // Track the download before generating the file
    if (shareId) {
      await trackDownload(shareId, "vcardDownloads", {
        profileName: profile.name,
        downloadType: "vcardDownloads",
      });
    }
    const vcard = generateVCard(profile);
    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name || "contact"}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    toast.success("Contact saved successfully!");

    return true;
  } catch (error) {
    console.error("Error downloading vCard:", error);
    toast.error("Failed to download contact");
    return false;
  }
};

export const downloadPdf = async (shareId) => { 
  try {
    const response = await api.post(`/share/${shareId}/downloadPdf`);
    return response;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    toast.error("Failed to download PDF");
    return false;
  }
};