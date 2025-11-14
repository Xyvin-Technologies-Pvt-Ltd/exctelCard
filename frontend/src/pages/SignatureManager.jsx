import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import SidebarLayout from "../components/SidebarLayout";
import SignaturePreview from "../components/outlook/SignaturePreview";
import { generatePreview } from "../api/outlook-signature.api";
import { useAuthStore } from "../store/authStore";
import { useProfile } from "../hooks/useProfile";

// Default HTML template
const DEFAULT_TEMPLATE = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    @font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/static/source/rev-0cb01a5/betasite.exctel.com/wp-content/uploads/2025/03/AktivGrotesk-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap}
    body{margin:0;padding:20px;font-family:"AktivGrotesk",Arial,sans-serif}
    </style></head><body><br/>
    <table cellpadding="0" cellspacing="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:15px;line-height:1.4;color:#333;width:600px">
    <tr>
    <td valign="top" style="padding-right:20px;width:180px">
    <div style="font-weight:bold;color:#000;font-size:17px;margin-bottom:2px">%%FirstName%% %%LastName%%</div>
    <div style="color:#000;font-size:16px;margin-bottom:15px">%%Title%%</div>
    <div style="margin-bottom:15px"><img src="https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/images/optimized/rev-6c1cac3/betasite.exctel.com/wp-content/uploads/2025/04/Exctel-Logo-FA.png" alt="Exctel" width="160" style="display:block"></div>
    </td>
    <td valign="top" style="padding-left:20px;font-size:14px;color:#333">
    <table cellpadding="3" cellspacing="0" style="font-size:14px">
    <tr><td style="width:20px;padding-right:8px"><img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="14" height="14" style="display:block"></td><td><a href="mailto:%%Email%%" style="color:#333;text-decoration:none">%%Email%%</a></td></tr>
    <tr><td style="padding-right:8px"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile" width="14" height="14" style="display:block"></td><td><a href="tel:%%MobileNumber%%" style="color:#333;text-decoration:none">%%MobileNumber%%</a></td></tr>
    <tr><td style="padding-right:8px"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile2" width="14" height="14" style="display:block"></td><td><a href="fax:%%FaxNumber%%" style="color:#333;text-decoration:none">%%FaxNumber%%</a></td></tr>
    <tr><td style="padding-right:8px"><img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="14" height="14" style="display:block"></td><td><a href="tel:%%PhoneNumber%%" style="color:#333;text-decoration:none">%%PhoneNumber%%</a></td></tr>
    <tr><td style="padding-right:8px;vertical-align:top"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" alt="Address" width="12" height="14" style="display:block"></td><td>%%Street%%</td></tr>
    </table>
    </td>
    </tr></table>
    <table width="600" cellpadding="0" cellspacing="0"><tr><td style="border-top:2px solid #ff8331;line-height:0;font-size:0;margin:2px;">&nbsp;</td></tr></table>
    <br/>
    <table cellpadding="0" cellspacing="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px">
    <tr><td style="width:180px;padding-right:20px"><a href="https://www.exctel.com" target="_blank" style="color:#000;text-decoration:none;font-weight:bold">www.exctel.com</a></td>
    <td style="padding-left:20px">
    <table cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:8px"><a href="https://linkedin.com/company/exctel" target="_blank"><img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block"></a></td>
    <td style="padding-right:8px"><a href="https://x.com/ExctelEngg" target="_blank"><img src="https://www.freeiconspng.com/uploads/new-x-twitter-logo-png-photo-1.png" width="20" height="20" alt="X" style="display:block"></a></td>
    <td style="padding-right:8px"><a href="https://facebook.com/exctel" target="_blank"><img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block"></a></td>
    <td style="padding-right:8px"><a href="https://www.instagram.com/exctelglobal" target="_blank"><img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block"></a></td>
    </tr></table>
    </td></tr></table>
    <table cellpadding="0" cellspacing="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:9px;line-height:1.4;color:#333;width:600px">
    <tr><td style="padding-top:10px;font-style:italic;color:#555;text-align:justify;">
        This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, please delete this message, notify the sender immediately, and note that any review, use, disclosure, or distribution of its contents is strictly prohibited. We accept no liability for any errors, delays, or security issues that may arise during the transmission of this email.    </td></tr></table>
    </body></html>`;

const SignatureManager = () => {
  const { token: accessToken, user: authUser } = useAuthStore();
  const { data: profileData } = useProfile();
  const [userProfile, setUserProfile] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyState, setCopyState] = useState("idle");

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

  // Fetch user profile from Graph API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!accessToken) {
          throw new Error("No access token available. Please log in.");
        }

        // Use profile data from auth store and profile API
        const profile = profileData?.profile || authUser;
        
        if (profile) {
          const graphUser = {
            givenName: profile.name?.split(' ')[0] || authUser?.name?.split(' ')[0] || '',
            surname: profile.name?.split(' ').slice(1).join(' ') || authUser?.name?.split(' ').slice(1).join(' ') || '',
            jobTitle: profile.jobTitle || authUser?.jobTitle || '',
            mail: profile.email || authUser?.email || '',
            mobilePhone: profile.phone || authUser?.phone || '',
            businessPhones: profile.phone ? [profile.phone] : [],
            streetAddress: profile.address || '',
            city: profile.city || '',
            state: profile.state || '',
            postalCode: profile.postalCode || '',
            country: profile.country || '',
            department: profile.department || authUser?.department || '',
            officeLocation: profile.address || '',
          };

          // Format address from components
          const addressParts = [];
          if (graphUser.streetAddress) addressParts.push(graphUser.streetAddress);
          if (graphUser.city) addressParts.push(graphUser.city);
          if (graphUser.state) addressParts.push(graphUser.state);
          if (graphUser.postalCode) addressParts.push(graphUser.postalCode);
          if (graphUser.country) addressParts.push(graphUser.country);
          
          // Use formatted address or fallback to officeLocation or default company address
          let formattedAddress = "";
          if (addressParts.length > 0) {
            formattedAddress = addressParts.join(", ");
          } else if (graphUser.officeLocation) {
            formattedAddress = graphUser.officeLocation;
          } else {
            // Default company address if no address data available
            formattedAddress = "Exctel Engineering Pte Ltd, Singapore";
          }
          
          // Debug: Log address data
          console.log("Address data from Graph API:", {
            streetAddress: graphUser.streetAddress,
            city: graphUser.city,
            state: graphUser.state,
            postalCode: graphUser.postalCode,
            country: graphUser.country,
            officeLocation: graphUser.officeLocation,
            formattedAddress: formattedAddress
          });

          // Map Graph API response to signature profile fields
          const mappedProfile = {
            firstName: graphUser.givenName || "",
            lastName: graphUser.surname || "",
            jobTitle: graphUser.jobTitle || "",
            companyName: "Exctel",
            mail: graphUser.mail || graphUser.userPrincipalName || "",
            mobilePhone: graphUser.mobilePhone || "",
            faxNumber: graphUser.mobilePhone || "", // Use mobile as fallback for fax
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

          // Generate preview with fetched data
          const previewData = {
            html_template: DEFAULT_TEMPLATE,
            user_profile: mappedProfile, // street is already set in mappedProfile
          };
          
          console.log("Preview data being sent to backend:", previewData);
          previewMutation.mutate(previewData);
        } else {
          throw new Error("Failed to fetch user profile");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message || "Failed to load user profile");
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, profileData, authUser]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in.");
      }

      // Use profile data from auth store and profile API
      const profile = profileData?.profile || authUser;
      
      if (profile) {
        const graphUser = {
          givenName: profile.name?.split(' ')[0] || authUser?.name?.split(' ')[0] || '',
          surname: profile.name?.split(' ').slice(1).join(' ') || authUser?.name?.split(' ').slice(1).join(' ') || '',
          jobTitle: profile.jobTitle || authUser?.jobTitle || '',
          mail: profile.email || authUser?.email || '',
          mobilePhone: profile.phone || authUser?.phone || '',
          businessPhones: profile.phone ? [profile.phone] : [],
          streetAddress: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postalCode: profile.postalCode || '',
          country: profile.country || '',
          department: profile.department || authUser?.department || '',
          officeLocation: profile.address || '',
        };

        // Format address from components
        const addressParts = [];
        if (graphUser.streetAddress) addressParts.push(graphUser.streetAddress);
        if (graphUser.city) addressParts.push(graphUser.city);
        if (graphUser.state) addressParts.push(graphUser.state);
        if (graphUser.postalCode) addressParts.push(graphUser.postalCode);
        if (graphUser.country) addressParts.push(graphUser.country);
        
        // Use formatted address or fallback to officeLocation or default company address
        let formattedAddress = "";
        if (addressParts.length > 0) {
          formattedAddress = addressParts.join(", ");
        } else if (graphUser.officeLocation) {
          formattedAddress = graphUser.officeLocation;
        } else {
          // Default company address if no address data available
          formattedAddress = "Exctel Engineering Pte Ltd, Singapore";
        }

        const mappedProfile = {
          firstName: graphUser.givenName || "",
          lastName: graphUser.surname || "",
          jobTitle: graphUser.jobTitle || "",
          companyName: "Exctel",
          mail: graphUser.mail || graphUser.userPrincipalName || "",
          mobilePhone: graphUser.mobilePhone || "",
          faxNumber: graphUser.mobilePhone || "",
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
        
        // Generate preview with fetched data
        const previewData = {
          html_template: DEFAULT_TEMPLATE,
          user_profile: mappedProfile, // street is already set in mappedProfile
        };
        
        previewMutation.mutate(previewData);
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
      setError(err.message || "Failed to refresh user profile");
      setIsLoading(false);
    }
  };

  return (
    <SidebarLayout
      backPath="/profile"
      backLabel="Back to Profile"
      initialCategory="outlook"
    >
      <div className="min-h-screen bg-gray-50">
        <div className="w-full mx-auto mt-6 mb-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
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
                  disabled={isLoading || previewMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading || previewMutation.isPending ? (
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
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6">
                <SignaturePreview 
                  html={previewHtml} 
                  isLoading={isLoading || previewMutation.isPending} 
                  onCopy={previewHtml ? copySignatureToClipboard : undefined}
                  copyState={copyState}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SignatureManager;
