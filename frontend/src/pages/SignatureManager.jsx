import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import SignaturePreview from "../components/outlook/SignaturePreview";
import { generatePreview } from "../api/outlook-signature.api";
import { useAuthStore } from "../store/authStore";
import { useProfile } from "../hooks/useProfile";
import { getProfileFromGraph } from "../api/profile";

const ZERO_WIDTH_SPACE = "\u200B";

const obfuscateEmail = (email) => {
  if (!email) return "";
  return email.replace(/([@.])/g, `$1${ZERO_WIDTH_SPACE}`);
};

// Generate short signature HTML from user profile
const generateShortSignature = (userProfile) => {
  if (!userProfile) return "";

  const parts = [];
  
  // Name
  const fullName = `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim();
  if (fullName) parts.push(fullName);
  
  // Job Title
  if (userProfile.jobTitle) parts.push(userProfile.jobTitle);
  
  // Email with icon
  if (userProfile.mail) {
    const emailPart = `<img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="12" height="12" style="display:inline-block;vertical-align:middle;margin-right:4px;border:none;outline:none">${obfuscateEmail(userProfile.mail)}`;
    parts.push(emailPart);
  }
  
  // Landline (PhoneNumber) with icon
  if (userProfile.phoneNumber) {
    const phonePart = `<img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="12" height="12" style="display:inline-block;vertical-align:middle;margin-right:4px;border:none;outline:none">${userProfile.phoneNumber}`;
    parts.push(phonePart);
  }

  const shortSignatureText = parts.join(" | ");
  
  if (!shortSignatureText) return "";

  // Return HTML with Outlook-compatible inline styles
  return `<p style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;margin:0;padding:0">${shortSignatureText}</p>`;
};

// Default HTML template - Outlook compatible with inline styles
const DEFAULT_TEMPLATE = `<!--[if mso]>
<style type="text/css">
    @font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/static/source/rev-0cb01a5/betasite.exctel.com/wp-content/uploads/2025/03/AktivGrotesk-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap}
body, table, td { font-family: "AktivGrotesk", Arial, sans-serif !important; }
</style>
<![endif]-->
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;width:600px;margin:0;padding:0">
<tr>
<td valign="top" style="padding-right:20px;width:180px;font-family:'AktivGrotesk',Arial,sans-serif">
<div style="font-weight:bold;color:#000;font-size:17px;margin-bottom:2px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%FirstName%% %%LastName%%</div>
<div style="color:#000;font-size:16px;margin-bottom:15px;font-family:'AktivGrotesk',Arial,sans-serif;line-height:1.2">%%Title%%</div>
<div style="margin-bottom:15px"><img src="https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/images/optimized/rev-6c1cac3/betasite.exctel.com/wp-content/uploads/2025/04/Exctel-Logo-FA.png" alt="Exctel" width="160" style="display:block;border:none;outline:none"></div>
    </td>
<td valign="top" style="padding-left:20px;font-size:14px;color:#333;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="3" cellspacing="0" border="0" style="font-size:14px;font-family:'AktivGrotesk',Arial,sans-serif">
<tr><td style="width:20px;padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Email%%</td></tr>
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%MobileNumber%%</td></tr>
%%IF_FAX%%<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Fax" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%FaxNumber%%</td></tr>%%ENDIF_FAX%%
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%PhoneNumber%%</td></tr>
<tr><td style="padding-right:8px;vertical-align:top;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" alt="Address" width="12" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Street%%</td></tr>
    </table>
    </td>
    </tr></table>
<table width="600" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid #ff8331;line-height:0;font-size:0;margin:2px;padding:0">&nbsp;</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px;margin-top:10px">
<tr><td style="width:180px;padding-right:20px;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#000;font-weight:bold;font-family:'AktivGrotesk',Arial,sans-serif">w&#8203;w&#8203;w&#8203;.&#8203;exctel&#8203;.&#8203;com</span></td>
<td style="padding-left:20px;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://www.freeiconspng.com/uploads/new-x-twitter-logo-png-photo-1.png" width="20" height="20" alt="X" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:none;outline:none"></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:none;outline:none"></td>
    </tr></table>
    </td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:9px;line-height:1.4;color:#333;width:600px;margin-top:10px">
<tr><td style="padding-top:10px;font-style:italic;color:#555;text-align:justify;font-family:'AktivGrotesk',Arial,sans-serif">
    This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, please delete this message, notify the sender immediately, and note that any review, use, disclosure, or distribution of its contents is strictly prohibited. We accept no liability for any errors, delays, or security issues that may arise during the transmission of this email.
</td></tr></table>`;

const SignatureManager = () => {
  const navigate = useNavigate();
  const { token: accessToken, user: authUser } = useAuthStore();
  const { data: profileData } = useProfile();
  const [userProfile, setUserProfile] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [shortSignatureHtml, setShortSignatureHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState("idle");
  const [shortCopyState, setShortCopyState] = useState("idle");

  // Fetch fresh user profile from Graph API
  const { data: graphProfileData, isLoading: isLoadingProfile, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["user-profile-from-graph"],
    queryFn: getProfileFromGraph,
    retry: 1,
    enabled: !!accessToken,
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: generatePreview,
    onSuccess: (data) => {
      setPreviewHtml(data.data.html);
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message || "Failed to generate preview");
      setIsLoading(false);
    },
  });

  const copyShortSignatureToClipboard = async () => {
    if (!shortSignatureHtml || isLoading || previewMutation.isPending) return;

    try {
      setShortCopyState("pending");

      if (navigator.clipboard?.write) {
        const blob = new Blob([shortSignatureHtml], { type: "text/html" });
        const item = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shortSignatureHtml);
      } else {
        throw new Error("Clipboard API not supported");
      }

      setShortCopyState("success");
      setTimeout(() => setShortCopyState("idle"), 3000);
    } catch (err) {
      console.error("Failed to copy short signature:", err);
      setShortCopyState("error");
      setTimeout(() => setShortCopyState("idle"), 4000);
    }
  };

  const copySignatureToClipboard = async () => {
    if (!previewHtml || isLoading || previewMutation.isPending) return;

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

  // Generate preview when Graph API profile data is available
  useEffect(() => {
    if (isLoadingProfile) {
        setIsLoading(true);
      return; // Wait for profile to load
    }

    if (profileError) {
      // Fallback to stored profile data if Graph API fails
      const profile = profileData?.profile || authUser;
      if (profile) {
        const graphUser = {
          givenName: profile.name?.split(' ')[0] || authUser?.name?.split(' ')[0] || '',
          surname: profile.name?.split(' ').slice(1).join(' ') || authUser?.name?.split(' ').slice(1).join(' ') || '',
          jobTitle: profile.jobTitle || authUser?.jobTitle || '',
          mail: profile.email || authUser?.email || '',
          mobilePhone: profile.phone || authUser?.phone || '',
          businessPhones: profile.businessPhones || (profile.phone ? [profile.phone] : []),
          streetAddress: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postalCode: profile.postalCode || '',
          country: profile.country || '',
          department: profile.department || authUser?.department || '',
        };

        // Format address
        const addressParts = [];
        if (graphUser.streetAddress) addressParts.push(graphUser.streetAddress);
        if (graphUser.city) addressParts.push(graphUser.city);
        if (graphUser.state) addressParts.push(graphUser.state);
        if (graphUser.postalCode) addressParts.push(graphUser.postalCode);
        if (graphUser.country) addressParts.push(graphUser.country);
        const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : "";

        const mappedProfile = {
          firstName: graphUser.givenName || "",
          lastName: graphUser.surname || "",
          jobTitle: graphUser.jobTitle || "",
          companyName: "Exctel",
          mail: graphUser.mail || "",
          mobilePhone: graphUser.mobilePhone || "",
          faxNumber: "",
          phoneNumber: Array.isArray(graphUser.businessPhones) && graphUser.businessPhones.length > 0
            ? graphUser.businessPhones[0]
            : "",
          street: formattedAddress,
          city: graphUser.city || "",
          state: graphUser.state || "",
          postalCode: graphUser.postalCode || "",
          country: graphUser.country || "",
          department: graphUser.department || "",
        };

        setUserProfile(mappedProfile);
      // Generate short signature
      const shortSig = generateShortSignature(mappedProfile);
      setShortSignatureHtml(shortSig);
      
      const previewData = {
        html_template: DEFAULT_TEMPLATE,
        user_profile: mappedProfile,
      };
      previewMutation.mutate(previewData);
      } else {
        setError(profileError.message || "Failed to load user profile");
        setIsLoading(false);
      }
      return;
    }

    // Use fresh profile from Graph API
    if (graphProfileData?.data) {
      setIsLoading(true);
      setError(null);

      const userProfile = graphProfileData.data;

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
        faxNumber: userProfile.faxNumber || "", // Only use actual fax number, no fallback
        street: userProfile.street || "",
        city: userProfile.city || "",
        state: userProfile.state || "",
        postalCode: userProfile.postalCode || "",
        country: userProfile.country || "",
        department: userProfile.department || "",
      };

      setUserProfile(mappedProfile);
      // Generate short signature
      const shortSig = generateShortSignature(mappedProfile);
      setShortSignatureHtml(shortSig);
        
        // Generate preview with fetched data
        const previewData = {
          html_template: DEFAULT_TEMPLATE,
        user_profile: mappedProfile,
        };
        
        previewMutation.mutate(previewData);
      }
  }, [graphProfileData, isLoadingProfile, profileError, profileData, authUser]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Refetch profile from Graph API
      await refetchProfile();
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setError(err.message || "Failed to refresh user profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Profile
        </button>
      </div>

      <div className="w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Outlook Signature Preview</h1>
                <p className="text-slate-600 mt-1">
                  Your personalized email signature preview
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                disabled={isLoading || isLoadingProfile || previewMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                {(isLoading || isLoadingProfile || previewMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
        {(error || profileError) && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
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

        {/* Preview Section */}
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Signature */}
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6">
              <SignaturePreview 
                html={previewHtml} 
                isLoading={isLoading || isLoadingProfile || previewMutation.isPending} 
                onCopy={previewHtml ? copySignatureToClipboard : undefined}
                copyState={copyState}
              />
            </div>

            {/* Short Signature */}
            {shortSignatureHtml && (
              <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6">
                <SignaturePreview 
                  html={shortSignatureHtml} 
                  isLoading={isLoading || isLoadingProfile || previewMutation.isPending} 
                  onCopy={shortSignatureHtml ? copyShortSignatureToClipboard : undefined}
                  copyState={shortCopyState}
                  title="Short Signature"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureManager;

