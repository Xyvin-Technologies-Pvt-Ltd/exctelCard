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
  ExternalLink,
  Smartphone,
  ChevronDown,
  Calendar,
  Clock,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  MessageCircle,
  Heart,
  Star,
  Plus,
  Minus,
  QrCode,
  Wallet,
  FileText,
  Image,
  Link,
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
import {
  downloadPdf,
  downloadVCard,
  downloadWalletPass,
  trackDownload,
} from "../api/share";

const ShareView = () => {
  const navigate = useNavigate();
  const { copyStates, resetCopyState } = useUIStore();
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  // Remove accordion state since we're showing all sections directly

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

  const handleDownload = async (type) => {
    if (!profile) return;

    setShowDownloadMenu(false);

    // Track download action
    if (profile?.shareId) {
      trackDownload(profile.shareId, "download", {
        action: `download_${type}`,
        timestamp: new Date().toISOString(),
      });
    }

    switch (type) {
      case "vcard":
        await downloadVCard(profile, profile.shareId);
        break;
      case "image":
        // Generate and download business card as PDF with both sides
        await generateBusinessCardPDF(profile);
        break;
      case "wallet":
        await downloadWalletPass(profile.shareId);
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

  // Generate PDF using backend API
  const generateBusinessCardPDF = async (profile) => {
    try {
      await downloadPdf(profile.shareId);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Remove toggle function since we're showing all sections directly

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-8 shadow-2xl">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100">
      {/* Professional Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ExctelCard</h1>
                <p className="text-sm text-gray-500">
                  Professional Digital Profiles
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy Profile Link"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            {/* Profile Avatar */}
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl ring-4 ring-white">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {profile.name}
            </h1>
            <p className="text-xl text-orange-600 font-semibold mb-2">
              {profile.jobTitle}
            </p>
            <p className="text-lg text-gray-600 mb-4">{profile.department}</p>

            {/* Status Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Available for Contact
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* Download Actions - Prominent at top */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Download className="w-5 h-5 text-orange-600 mr-2" />
              Download & Save
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Primary Download Button */}
              <div className="relative flex-1">
                <Button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Business Card
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${
                      showDownloadMenu ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {/* Download Dropdown Menu */}
                {showDownloadMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-2">
                      <button
                        onClick={() => handleDownload("vcard")}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700"
                      >
                        <FileText className="w-5 h-5 mr-3 text-blue-600" />
                        <div>
                          <div className="font-medium">vCard (.vcf)</div>
                          <div className="text-sm text-gray-500">
                            Save to contacts
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDownload("image")}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700"
                      >
                        <FileText className="w-5 h-5 mr-3 text-green-600" />
                        <div>
                          <div className="font-medium">PDF (.pdf)</div>
                          <div className="text-sm text-gray-500">
                            Download both sides as PDF
                          </div>
                        </div>
                      </button>
                      {/* <button
                        onClick={() => handleDownload("wallet")}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700"
                      >
                        <Wallet className="w-5 h-5 mr-3 text-black" />
                        <div>
                          <div className="font-medium">Apple Wallet</div>
                          <div className="text-sm text-gray-500">
                            Add to Apple Wallet
                          </div>
                        </div>
                      </button> */}
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Link Button */}
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-sm flex items-center justify-center"
              >
                {copyStates.shareLink ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Copy Profile Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Professional Information - All sections displayed directly */}
        <div className="space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 text-orange-600 mr-2" />
              About
            </h3>
            <div className="pt-2">
              <p className="text-gray-600 leading-relaxed">
                Professional {profile.jobTitle?.toLowerCase()} at{" "}
                {profile.department} with expertise in delivering exceptional
                results. Passionate about innovation and committed to excellence
                in every project.
              </p>
            </div>
          </div>

          {/* Professional Experience Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 text-orange-600 mr-2" />
              Professional Experience
            </h3>
            <div className="pt-2 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {profile.jobTitle}
                  </h4>
                  <p className="text-orange-600 font-medium">
                    {profile.department}
                  </p>
                  <p className="text-sm text-gray-500">Current Position</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 text-orange-600 mr-2" />
              Contact Information
            </h3>
            <div className="pt-2 space-y-4">
              {profile.email && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile.email}
                    </p>
                  </div>
                  <a
                    href={`mailto:${profile.email}`}
                    onClick={() => handleContactClick("email", profile.email)}
                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${profile.phone}`}
                    onClick={() => handleContactClick("phone", profile.phone)}
                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {profile.linkedIn && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      LinkedIn
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      View Professional Profile
                    </p>
                  </div>
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      handleContactClick("linkedin", profile.linkedIn)
                    }
                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {profile.address && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Digital Business Card - Moved to bottom */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="w-5 h-5 text-orange-600 mr-2" />
              Digital Business Card
            </h3>
            <div className="business-card-image flex justify-center">
              <Card
                user={profile}
                isFlippable={true}
                qrCodeData={window.location.href}
                className="shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              ExctelCard
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-1">
            Professional Digital Profiles
          </p>
          <p className="text-xs text-gray-400">
            Create your own professional digital profile
          </p>
        </div>
      </div>

      {/* Click outside to close download menu */}
      {showDownloadMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDownloadMenu(false)}
        />
      )}
    </div>
  );
};

export default ShareView;
