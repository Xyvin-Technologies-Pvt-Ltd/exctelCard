import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import SignaturePreview from "../outlook/SignaturePreview";
import { generatePreview } from "../../api/outlook-signature.api";
import { getUserProfileFromGraphAdmin } from "../../api/users";

/**
 * SignaturePreviewModal - Modal component for previewing and copying user signatures
 */
const SignaturePreviewModal = ({ isOpen, onClose, config, userName, userEmail }) => {
  const [previewHtml, setPreviewHtml] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [error, setError] = useState(null);

  // Fetch fresh user profile from Graph API
  const { data: graphProfileData, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ["user-profile-from-graph", config?.user_id],
    queryFn: () => getUserProfileFromGraphAdmin(config.user_id),
    enabled: isOpen && !!config?.user_id,
    retry: 1,
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: generatePreview,
    onSuccess: (data) => {
      setPreviewHtml(data.data.html);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to generate preview");
      setPreviewHtml("");
    },
  });

  // Generate preview when modal opens, config changes, or fresh profile data is available
  useEffect(() => {
    if (isOpen && config) {
      setError(null);
      setPreviewHtml("");

      // Wait for Graph API profile if it's loading, otherwise use stored profile as fallback
      if (isLoadingProfile) {
        return; // Wait for profile to load
      }

      // Use fresh profile from Graph API if available, otherwise fallback to stored profile
      const userProfile = graphProfileData?.data || config.user_profile || {};

      // Map Graph API profile to signature profile format with phone number logic
      const mappedProfile = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        jobTitle: userProfile.jobTitle || "",
        companyName: userProfile.companyName || "Exctel",
        mail: userProfile.mail || "",
        mobilePhone: userProfile.mobilePhone || "",
        // Phone number logic: only include PhoneNumber if both mobilePhone and businessPhones exist
        phoneNumber: (userProfile.mobilePhone && userProfile.businessPhones?.length > 0)
          ? (userProfile.businessPhones[0] || "")
          : "",
        faxNumber: userProfile.mobilePhone || userProfile.faxNumber || "", // Use mobile as fallback for fax
        street: userProfile.street || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        postalCode: userProfile.postalCode || "",
        country: userProfile.country || "",
        department: userProfile.department || "",
      };

      // Prepare preview data
      const previewData = {
        html_template: config.html_template,
        user_profile: mappedProfile,
        placeholders: config.placeholders || {},
      };

      previewMutation.mutate(previewData);
    }
  }, [isOpen, config, graphProfileData, isLoadingProfile]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewHtml("");
      setError(null);
      setCopyState("idle");
    }
  }, [isOpen]);

  const copySignatureToClipboard = async () => {
    if (!previewHtml || previewMutation.isPending) return;

    try {
      setCopyState("pending");

      if (navigator.clipboard?.write) {
        const blob = new Blob([previewHtml], { type: "text/html" });
        const item = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(previewHtml);
      } else {
        throw new Error("Clipboard API not supported");
      }

      setCopyState("success");
      setTimeout(() => setCopyState("idle"), 3000);
    } catch (err) {
      console.error("Failed to copy signature:", err);
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Signature Preview</h2>
              {userName && (
                <p className="text-sm text-gray-600 mt-1">
                  {userName} {userEmail && `(${userEmail})`}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {(error || profileError) && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {profileError?.response?.data?.message || profileError?.message || error}
                  </span>
                </div>
                {profileError && (
                  <p className="text-sm mt-1 text-red-600">
                    Using stored profile data as fallback
                  </p>
                )}
              </div>
            )}

            <SignaturePreview
              html={previewHtml}
              isLoading={isLoadingProfile || previewMutation.isPending}
              onCopy={previewHtml ? copySignatureToClipboard : undefined}
              copyState={copyState}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePreviewModal;

