import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  FaCopy,
  FaCheck,
  FaQrcode,
  FaShareAlt,
  FaLock,
  FaInfoCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
} from "react-icons/fa";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import { useProfileOperations } from "../hooks/useProfile";

// Read-only field component for Entra ID data
const ReadOnlyField = ({ label, value, helperText, icon: Icon }) => (
  <div className="space-y-2">
    <label className="flex items-center text-sm font-medium text-gray-700">
      <Icon className="mr-2 text-gray-500" />
      {label}
      <FaLock
        className="inline ml-2 text-xs text-gray-400"
        title="This field is managed by your organization"
      />
    </label>
    <div className="w-full px-4 py-3 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
      {value || "Not provided"}
    </div>
    {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
  </div>
);

// Data freshness indicator
const DataFreshness = ({ dataUpdatedAt, isStale }) => {
  if (!dataUpdatedAt) return null;

  const lastUpdated = new Date(dataUpdatedAt);
  const now = new Date();
  const minutesAgo = Math.floor((now - lastUpdated) / (1000 * 60));

  return (
    <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
      <FaInfoCircle className="mr-2 text-blue-500" />
      <span>
        Data last updated{" "}
        {minutesAgo === 0 ? "just now" : `${minutesAgo} minutes ago`}
        {isStale && " (refreshing in background)"}
      </span>
    </div>
  );
};

// Profile preview card
const ProfilePreview = ({ profile }) => (
  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
    <div className="text-center">
      <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-bold text-white">
          {profile.name?.charAt(0) || "U"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {profile.name}
      </h3>
      <p className="text-sm text-gray-600 mb-2">{profile.jobTitle}</p>
      <p className="text-xs text-gray-500">{profile.department}</p>
      <div className="mt-4 pt-4 border-t border-orange-200">
        <p className="text-xs text-orange-700 font-medium">
          This is how your profile appears to others
        </p>
      </div>
    </div>
  </Card>
);

const Profile = () => {
  // Auth store for user data
  const { user: authUser } = useAuthStore();

  // Profile store for UI state
  const { copyStates, copyToClipboard, generateUrls } = useProfileStore();

  // TanStack Query hooks for data operations
  const {
    profile,
    isLoading,
    error,
    syncProfile,
    updateProfile,
    generateShareId,
    isSyncing,
    isUpdating,
    isGeneratingShareId,
    refreshProfile,
    isStale,
    dataUpdatedAt,
  } = useProfileOperations();

  // Track if we've already synced to prevent multiple calls
  const hasSynced = useRef(false);

  // Check if user is SSO user (not admin/super admin)
  const isSSO =
    authUser?.role !== "admin" &&
    authUser?.role !== "super_admin" &&
    authUser?.loginType !== "admin";

  // Use profile data or fallback to auth user data
  const currentProfile = profile || {
    name: authUser?.name,
    email: authUser?.email,
    department: authUser?.department,
    jobTitle: authUser?.jobTitle,
    phone: "",
    linkedIn: "",
    profileImage: "",
    shareId: "",
  };

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    getValues,
  } = useForm({
    defaultValues: {
      phone: currentProfile.phone || "",
      linkedIn: currentProfile.linkedIn || "",
      profileImage: currentProfile.profileImage || "",
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || "",
        linkedIn: profile.linkedIn || "",
        profileImage: profile.profileImage || "",
      });
    }
  }, [profile, reset]);

  // Sync profile with SSO data on component mount (only for SSO users)
  useEffect(() => {
    if (authUser && !hasSynced.current && !profile && isSSO) {
      console.log("Initial profile sync for SSO user");
      syncProfile();
      hasSynced.current = true;
    } else if (authUser && !isSSO) {
      console.log("Skipping sync for admin/super admin user");
    }
  }, [authUser, syncProfile, profile, isSSO]);

  // Generate URLs using store helper
  const { directShareableUrl, hasShareId } = generateUrls(currentProfile);

  // Event handlers
  const handleCopyShareLink = () => {
    copyToClipboard(directShareableUrl, "shareLink");
  };

  const handleGenerateShareId = async () => {
    try {
      await generateShareId();
    } catch (error) {
      console.error("Error generating share ID:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateProfile(data);
      reset(getValues()); // Reset form with updated values
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleReset = () => {
    reset({
      phone: currentProfile.phone || "",
      linkedIn: currentProfile.linkedIn || "",
      profileImage: currentProfile.profileImage || "",
    });
  };

  const handleManualRefresh = () => {
    refreshProfile();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          title="Failed to load profile"
          description={`Error loading profile: ${error.message}`}
          action={
            <div className="space-y-2">
              <Button onClick={handleManualRefresh}>Retry</Button>
              <p className="text-xs text-gray-500">
                If the error persists, try refreshing the page in a few minutes
              </p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your professional profile and sharing preferences
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="flex items-center"
            >
              <FaInfoCircle className="mr-2" />
              Refresh Data
            </Button>
            <a
              href="/qrcode"
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaQrcode className="mr-2" />
              QR Code
            </a>
          </div>
        </div>

        <DataFreshness dataUpdatedAt={dataUpdatedAt} isStale={isStale} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Preview
            </h2>
            <ProfilePreview profile={currentProfile} />

            {/* Share Section */}
            <Card className="mt-6">
              <Card.Header>
                <Card.Title className="flex items-center">
                  <FaShareAlt className="mr-2 text-green-600" />
                  Share Your Profile
                </Card.Title>
              </Card.Header>
              <Card.Content>
                {hasShareId ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Your shareable link
                      </p>
                      <p className="text-sm font-mono text-gray-800 break-all">
                        {directShareableUrl}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyShareLink}
                      className="w-full flex items-center justify-center"
                      variant={copyStates.shareLink ? "success" : "primary"}
                    >
                      {copyStates.shareLink ? (
                        <>
                          <FaCheck className="mr-2" /> Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy className="mr-2" /> Copy Share Link
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-600">
                      Anyone with this link can view your business card
                      information.
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Generate a shareable link to easily share your profile
                      with others.
                    </p>
                    <Button
                      onClick={handleGenerateShareId}
                      variant="success"
                      className="w-full flex items-center justify-center"
                      loading={isGeneratingShareId}
                      disabled={isGeneratingShareId}
                    >
                      {isGeneratingShareId ? (
                        "Generating..."
                      ) : (
                        <>
                          <FaShareAlt className="mr-2" /> Generate Share Link
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Profile Information</Card.Title>
              <Card.Description>
                Update your contact information. Organization fields are managed
                by your admin.
              </Card.Description>
            </Card.Header>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Card.Content className="space-y-6">
                {/* Organization Information (Read-only) */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Organization Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReadOnlyField
                      label="Full Name"
                      value={currentProfile.name}
                      helperText="Managed by your organization"
                      icon={FaUser}
                    />

                    <ReadOnlyField
                      label="Email Address"
                      value={currentProfile.email}
                      helperText="Your organization email"
                      icon={FaEnvelope}
                    />

                    <ReadOnlyField
                      label="Job Title"
                      value={currentProfile.jobTitle}
                      helperText="Managed by HR"
                      icon={FaBriefcase}
                    />

                    <ReadOnlyField
                      label="Department"
                      value={currentProfile.department}
                      helperText="Set by your organization"
                      icon={FaBriefcase}
                    />
                  </div>
                </div>

                {/* Contact Information (Editable) */}

                <ReadOnlyField
                  label="Phone Number"
                  value={currentProfile.phone}
                  helperText="Your contact phone number"
                  icon={FaPhone}
                />
              </Card.Content>
            </form>
          </Card>
        </div>
      </div>

      {/* Sync Status */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <LoadingSpinner size="sm" className="mr-2" />
            Syncing with organization data...
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
