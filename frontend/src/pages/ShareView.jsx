import React, { useEffect } from "react";
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
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { useUIStore } from "../store/uiStore";
import {
  useSharedProfile,
  useTrackProfileView,
  useTrackDownload,
} from "../hooks/useShare";
import { downloadVCard, trackDownload } from "../api/share";

const ShareView = () => {
  const navigate = useNavigate();
  const { copyStates, resetCopyState } = useUIStore();

  // Fetch shared profile data
  const { data: profileData, isLoading, error } = useSharedProfile();
  const trackViewMutation = useTrackProfileView();
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
  }, [profileData]);

  const profile = profileData?.profile;

  const handleSaveToContacts = async () => {
    if (!profile) return;

    // Use the enhanced download function with tracking
    await downloadVCard(profile, profile.shareId);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4 font-medium">
            Loading digital card...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Card Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This digital business card doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Company Header */}
      <div className="bg-white shadow-sm border-b border-orange-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ExctelCard</h1>
                <p className="text-xs text-gray-500">Digital Business Cards</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-4xl mx-auto p-4 pb-8">
        {/* Profile Header */}
        <div className="text-center mb-4 mt-2 sm:mb-6 sm:mt-4">
          <div className="relative inline-block mb-3 sm:mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {profile.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {profile.name}
          </h2>
          <p className="text-orange-600 font-medium mb-1 text-sm sm:text-base">
            {profile.jobTitle}
          </p>
          <p className="text-gray-600 text-xs sm:text-sm">
            {profile.department}
          </p>
        </div>

        {/* Digital Card */}
        <div className="mb-4 sm:mb-6">
          <Card
            user={profile}
            isFlippable={true}
            qrCodeData={window.location.href}
            className="shadow-xl mx-auto"
          />
        </div>

        {/* Contact Information Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" />
            Contact Information
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {profile.email && (
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                    Email
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {profile.email}
                  </p>
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  onClick={() => handleContactClick("email", profile.email)}
                  className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            )}

            {profile.phone && (
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                    Phone
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {profile.phone}
                  </p>
                </div>
                <a
                  href={`tel:${profile.phone}`}
                  onClick={() => handleContactClick("phone", profile.phone)}
                  className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            )}

            {profile.linkedIn && (
              <div className="flex items-center p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1">
                    LinkedIn
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    View Profile
                  </p>
                </div>
                <a
                  href={profile.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    handleContactClick("linkedin", profile.linkedIn)
                  }
                  className="p-1.5 sm:p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 sm:space-y-3">
          {/* Primary Action */}
          <Button
            onClick={handleSaveToContacts}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
            Save to Contacts
          </Button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm sm:text-base"
            >
              {copyStates.shareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const cardElement = document.querySelector(
                  ".card-flip-container"
                );
                if (cardElement) {
                  cardElement.click();
                }
              }}
              className="py-2.5 sm:py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm sm:text-base"
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Flip Card
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">
            Powered by{" "}
            <span className="font-semibold text-orange-600">ExctelCard</span>
          </p>
          <p className="text-[10px] sm:text-xs text-gray-400">
            Create your own digital business card
          </p>
        </div>
      </div>

      {/* Desktop Enhancement Styles */}
      <style>
        {`
          @media (min-width: 768px) {
            .contact-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1rem;
            }
          }

          @media (min-width: 1024px) {
            .main-content {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
              align-items: start;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ShareView;
