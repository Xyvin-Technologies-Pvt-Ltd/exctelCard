import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  FaDownload,
  FaShareAlt,
  FaCopy,
  FaCheck,
  FaArrowLeft,
  FaUser,
  FaQrcode,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import Card from "../ui/Card";
import { useAuthStore } from "../store/authStore";
import { useProfileOperations } from "../hooks/useProfile";
import { useProfileStore } from "../store/profileStore";

export default function QRCode() {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  // Auth and profile data
  const { user: authUser } = useAuthStore();
  const { profile, isLoading, error, generateShareId, isGeneratingShareId } =
    useProfileOperations();
  const { copyStates, copyToClipboard, generateUrls } = useProfileStore();

  // Use profile data or fallback to auth user data
  const currentProfile = profile || {
    name: authUser?.name,
    email: authUser?.email,
    department: authUser?.department,
    jobTitle: authUser?.jobTitle,
    shareId: "",
  };

  const { directShareableUrl, hasShareId } = generateUrls(currentProfile);

  const downloadQR = () => {
    try {
      // Create canvas element to convert SVG to image
      const svg = qrRef.current;
      if (!svg) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = 400;
        canvas.height = 400;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, 0, 0, 400, 400);

        // Download the image
        const link = document.createElement("a");
        link.download = `${
          currentProfile.name?.toLowerCase().replace(/\s+/g, "_") || "profile"
        }-qr-code.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  const shareQR = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${currentProfile.name}'s Digital Business Card`,
          text: "Check out my digital business card",
          url: directShareableUrl,
        });
      } else {
        // Fallback: copy to clipboard
        copyToClipboard(directShareableUrl, "shareLink");
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
    }
  };

  const handleGenerateShareId = async () => {
    try {
      await generateShareId();
    } catch (error) {
      console.error("Error generating share ID:", error);
    }
  };

  const handleCopyLink = () => {
    copyToClipboard(directShareableUrl, "shareLink");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 font-medium">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <EmptyState
          title="Failed to load profile"
          description="There was an error loading your profile data."
          action={
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Go to Profile
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Code</h1>
              <p className="text-gray-600 mt-1">
                Share your digital business card with a QR code
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaQrcode className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        {hasShareId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Display */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Your QR Code
                </h2>

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-white rounded-2xl shadow-inner border-2 border-gray-100">
                    <QRCodeSVG
                      ref={qrRef}
                      value={directShareableUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-lg font-bold text-white">
                        {currentProfile.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {currentProfile.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentProfile.jobTitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Scan this QR code to view the digital business card
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={downloadQR}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  >
                    <FaDownload className="mr-2" />
                    Download QR Code
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={shareQR}
                      className="py-3"
                    >
                      <FaShareAlt className="mr-2" />
                      Share
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="py-3"
                    >
                      {copyStates.shareLink ? (
                        <>
                          <FaCheck className="mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy className="mr-2" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Preview */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Preview
              </h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  This is how your digital business card appears when someone
                  scans your QR code:
                </p>

                {/* Card Preview */}
                <div className="transform scale-90 origin-top">
                  <Card
                    user={currentProfile}
                    qrCodeData={directShareableUrl}
                    isFlippable={false}
                  />
                </div>
              </div>

              {/* Share URL */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Share URL
                </p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {directShareableUrl}
                </p>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  How to use your QR code:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Print it on business cards or flyers</li>
                  <li>• Display it at events or meetings</li>
                  <li>• Share it digitally via email or social media</li>
                  <li>• Add it to your email signature</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // No Share ID - Generate First
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaQrcode className="w-12 h-12 text-orange-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generate Your QR Code
            </h2>

            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a shareable QR code for your digital business card. Anyone
              can scan it to instantly access your contact information.
            </p>

            <Button
              onClick={handleGenerateShareId}
              variant="success"
              className="px-8 py-3 text-lg"
              loading={isGeneratingShareId}
              disabled={isGeneratingShareId}
            >
              {isGeneratingShareId ? (
                "Generating..."
              ) : (
                <>
                  <FaQrcode className="mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You need to generate a share link first
                before creating a QR code. This ensures your digital business
                card is accessible to others.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
