import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Download,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Building,
  MapPin,
 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { useUIStore } from "../store/uiStore";
import {
  useSharedProfile,
  useTrackWebsiteView,
  useTrackDownload,
} from "../hooks/useShare";
import { downloadVCard,  trackDownload } from "../api/share";
import { generateBusinessCardPDFSeparatePages } from "../utils/pdfGenerator";
import { FaMobileAlt } from "react-icons/fa";
import { TbDeviceLandlinePhone } from "react-icons/tb";

const ShareView = () => {
  const navigate = useNavigate();
  const { copyStates, resetCopyState } = useUIStore();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // Remove accordion state since we're showing all sections directly

  // Fetch shared profile data
  const { data: profileData, isLoading, error } = useSharedProfile();
  const trackViewMutation = useTrackWebsiteView();
  const trackDownloadMutation = useTrackDownload();
  // Track profile view on component mount
  useEffect(() => {
    if (profileData?.profile) {
      trackViewMutation.mutate({
        shareId: profileData.profile.shareId,
        metadata: {
          viewType: "share_page",
          timestamp: new Date().toISOString(),
        },
      });
    }
    console.log("profileData", profileData);
  }, [profileData]);

  const profile = profileData?.profile;

  const handleDownload = async (type) => {
    if (!profile) return;

    setShowDownloadMenu(false);

    // Track download action
    if (profile?.shareId) {
      trackDownloadMutation.mutate({
        shareId: profile.shareId,
        downloadType: type,
        metadata: {
        action: `download_${type}`,
        timestamp: new Date().toISOString(),
        },
      });
    }

    switch (type) {
      case "vcardDownloads":
        await downloadVCard(profile, profile.shareId);
        break;
      case "bizcardDownloads":
        // Generate and download business card as PDF with both sides using frontend
        await generateBusinessCardPDFFrontend(profile);
        break;
      case "qrcode":
        await downloadQRCode(profile.shareId);
        break;
      default:
        break;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      resetCopyState("shareLink");

      // Track link copy action
      if (profile?.shareId) {
        trackDownload(profile.shareId, "link_copy", {
          action: "copy_share_link",
          url: window.location.href,
        });
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleContactClick = (contactType, contactValue) => {
    // Track contact interaction
    if (profile?.shareId) {
      trackDownload(profile.shareId, "contact_interaction", {
        contactType: contactType,
        contactValue: contactValue,
        action: `click_${contactType}`,
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSaveContact = () => {
    // Mock save to phone functionality
    console.log("Saving contact to phone...");
  };

  // Generate PDF using frontend (Card component)
  const generateBusinessCardPDFFrontend = async (profile) => {
    setIsGeneratingPDF(true);
    try {
      await generateBusinessCardPDFSeparatePages(profile, window.location.href);
      // Show success message
      const { toast } = await import("react-hot-toast");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      const { toast } = await import("react-hot-toast");
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const downloadQRCode = async (shareId) => {
    try {
      console.log("Starting QR code download from backend...");

      // Call backend API to get QR code data
      const response = await fetch(`/api/qrcode/share/${shareId}`);

      if (!response.ok) {
        throw new Error(`Failed to get QR code: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.data.qrCode) {
        throw new Error("No QR code data received from server");
      }

      // Convert base64 data URL to blob
      const base64Data = result.data.qrCode.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${
        profile?.name?.toLowerCase().replace(/\s+/g, "_") || "profile"
      }-qr-code.png`;

      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Download initiated for:", fileName);

      // Show success message
      const { toast } = await import("react-hot-toast");
      toast.success("QR Code downloaded successfully!");
    } catch (error) {
      console.error("Error downloading QR code:", error);

      // Fallback: try client-side generation
      try {
        console.log("Falling back to client-side QR generation...");

        // Find the QR code element - look for the QRCodeWithLogo component
        let qrCodeElement =
          document.querySelector(".block.md\\:hidden svg") ||
          document.querySelector(".hidden.md\\:block svg") ||
          document.querySelector("svg");

        if (!qrCodeElement) {
          throw new Error("QR code element not found");
        }

        // Get the parent container for better capture
        const qrContainer =
          qrCodeElement.closest(".bg-white.bg-opacity-90") ||
          qrCodeElement.parentElement;

        // Use html2canvas to capture the QR code
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(qrContainer || qrCodeElement, {
          backgroundColor: "#ffffff",
          scale: 3,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: 200,
          height: 200,
        });

        // Download the image
        const link = document.createElement("a");
        const fileName = `${
          profile?.name?.toLowerCase().replace(/\s+/g, "_") || "profile"
        }-qr-code.png`;
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const { toast } = await import("react-hot-toast");
        toast.success("QR Code downloaded successfully!");
      } catch (fallbackError) {
        console.error("Fallback QR generation failed:", fallbackError);
        const { toast } = await import("react-hot-toast");
        toast.error("Failed to download QR code");
      }
    }
  };

  // Remove toggle function since we're showing all sections directly

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md w-full">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 font-medium">
            Loading professional profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This professional profile doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Home Banner Video */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <video
          className="w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/Exctel-Home-Banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Video Overlay */}
      </div>

      <div className="px-4 py-2">
        <div className="mx-auto max-w-md space-y-6">
          {/* Main Business Card */}
          <div className="overflow-hidden bg-white shadow-lg rounded-xl">
            {/* Profile Section with Background */}
            <div
              className="relative px-6 py-8 text-center text-white bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wyMDczNnwwfDF8c2VhcmNofDk2fHxjeWJlcnNlY3VyaXR5fGVufDB8fHx8MTc1MTg0MDIyMXww&ixlib=rb-4.1.0&q=80&w=1080')`,
              }}
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    {profile.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1 drop-shadow-sm">
                {profile.name}
              </h2>
              <p className="text-gray-100 mb-3 drop-shadow-sm">
                {profile.jobTitle}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-white/80 text-gray-900 rounded-full text-sm font-medium border border-white/50 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Available for Contact
              </div>
            </div>

            {/* Company Section */}
            <div className="px-6 py-4">
              <div className="flex items-center mb-4">
                <div>
                  <img
                    src="/exctel-logo.png"
                    alt="Exctel Card"
                    className=" h-8"
                  />
                  <p className="text-sm text-gray-600">Driven by Excellence</p>
                  <p
                    className="text-sm text-gray-600 pt-2 cursor-pointer"
                    onClick={() =>
                      window.open("https://www.exctel.com", "_blank")
                    }
                  >
                    www.exctel.com{" "}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Contact Information */}
              <div className="space-y-3">
                {profile.email && (
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="mr-3 text-gray-600" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-sm">
                    <FaMobileAlt size={16} className="mr-3 text-gray-600" />
                    <span className="text-gray-700">{profile.phone}</span>
                  </div>
                )}
                {/* {profile.businessPhones && (
                  <div className="flex items-center text-sm">
                    <TbDeviceLandlinePhone size={16} className="mr-3 text-gray-600" />
                    <span className="text-gray-700">{profile.businessPhones[0]}</span>
                  </div>
                )} */}
                {profile.address && (
                  <div className="flex items-start text-sm">
                    <MapPin
                      size={16}
                      className="mr-3 mt-0.5 text-gray-600 flex-shrink-0"
                    />
                    <span className="text-gray-700">{profile.address}</span>
                  </div>
                )}
                {profile.linkedIn && (
                  <div className="flex items-center text-sm">
                    <User size={16} className="mr-3 text-gray-600" />
                    <span className="text-gray-700">LinkedIn Profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Download Business Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Download size={16} className="mr-2" />
                Download Cards
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload("vcardDownloads")}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                >
                  vCard
                </Button>
                <Button
                  onClick={() => handleDownload("bizcardDownloads")}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? "Generating..." : "BizCard"}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Copy size={16} className="mr-2" />
                Copy Link
              </Button>
              <Button
                onClick={() => handleDownload("qrcode")}
                variant="outline"
                className="flex items-center justify-center border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <User size={16} className="mr-2" />
                Save QR Code
              </Button>
            </div>
          </div>

          {/* Digital Business Card Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Digital Business Card Preview
            </h3>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <Card
                  user={{
                    name: profile.name,
                    title: profile.jobTitle,
                    email: profile.email,
                    phone: profile.phone,
                    phone2: profile.businessPhones,
                    address: profile.address,
                  }}
                  qrCodeData={window.location.href}
                  isFlippable={true}
                />
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Tap to flip and see QR code
            </p>
          </div>

          {/* Footer */}
          {/* <div className="text-center py-4">
            <div className="flex items-center justify-center mb-2">
              <img src="/exctel-logo.png" alt="Exctel Card" className=" h-8" />
            </div>
          
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ShareView;
