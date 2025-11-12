import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Loader2, AlertCircle, Download, Code, FileCode, ChevronDown, ChevronUp, ExternalLink, Copy, Check } from "lucide-react";
import SidebarLayout from "../../components/SidebarLayout";
import SignaturePreview from "../../components/outlook/SignaturePreview";
import ManifestDebugger from "../../components/outlook/ManifestDebugger";
import { generatePreview, createConfig, getAllConfigs, generateAddin, generateAdminAddin } from "../../apis/outlook-signature.api";
import { getUserPreferences, updateUserPreferences } from "../../apis/users.api";
import useAuthStore from "../../store/auth";
import loginAPI from "../../apis/login.api";

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
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [userProfile, setUserProfile] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addinFiles, setAddinFiles] = useState(null);
  const [showAddinFiles, setShowAddinFiles] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [adminAddinFiles, setAdminAddinFiles] = useState(null);
  const [showAdminAddinFiles, setShowAdminAddinFiles] = useState(false);
  const [copyState, setCopyState] = useState("idle");
  const SHOW_ADVANCED_ADDIN_CONTROLS = false;
  
  // Fetch user preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: getUserPreferences,
    enabled: !!accessToken,
  });

  const preferences = useMemo(() => preferencesData?.data || {}, [preferencesData?.data]);
  // Explicitly check: true if value is true or undefined, false if value is explicitly false
  // Direct boolean check - if undefined/null, default to true, otherwise use the actual boolean value
  const autoInsertValue = preferences.outlook_signature_auto_insert;
  const autoInsert = autoInsertValue === undefined || autoInsertValue === null ? true : autoInsertValue === true;
  
  // Debug: Log preference values
  useEffect(() => {
    if (preferencesData) {
      console.log("Preferences data:", preferencesData);
      console.log("Extracted preferences:", preferences);
      console.log("Auto-insert raw value:", autoInsertValue, typeof autoInsertValue);
      console.log("Computed autoInsert:", autoInsert, typeof autoInsert);
    }
  }, [preferencesData, preferences, autoInsertValue, autoInsert]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: updateUserPreferences,
    onSuccess: async (response) => {
      console.log("Preferences update response:", response);
      // Update query data immediately
      queryClient.setQueryData(["user-preferences"], response);
      // Also refetch to ensure sync
      await queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });

  // Handle toggle change
  const handleToggleAutoInsert = async (enabled) => {
    try {
      await updatePreferencesMutation.mutateAsync({
        outlook_signature_auto_insert: enabled,
      });
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError("Failed to update auto-insert setting");
    }
  };

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

  // Fetch existing configs to get ID
  const { data: configsData } = useQuery({
    queryKey: ["outlook-signature-configs"],
    queryFn: getAllConfigs,
    enabled: !!accessToken,
  });

  // Set config ID if one exists
  useEffect(() => {
    if (configsData?.data && Array.isArray(configsData.data) && configsData.data.length > 0) {
      setConfigId(configsData.data[0]._id);
    }
  }, [configsData]);

  // Generate add-in mutation
  const generateAddinMutation = useMutation({
    mutationFn: async () => {
      // First, create or update config
      let configIdToUse = configId;
      
      if (!configIdToUse) {
        // Create new config
        const configData = {
          signature_name: "My Outlook Signature",
          html_template: DEFAULT_TEMPLATE,
          user_profile: userProfile || {},
          description: "Auto-generated signature configuration",
        };
        const createResult = await createConfig(configData);
        configIdToUse = createResult.data._id;
        setConfigId(configIdToUse);
      } else {
        // Update existing config with current template
        // Note: We'd need an updateConfig call here if we want to update, but for now just use existing
      }
      
      // Generate add-in files
      const result = await generateAddin(configIdToUse);
      return result;
    },
    onSuccess: (data) => {
      setAddinFiles(data.data);
      setShowAddinFiles(true);
      setError(null);
      
      // Automatically download manifest.xml
      if (data.data?.manifest) {
        const blob = new Blob([data.data.manifest], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "manifest.xml";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
    onError: (err) => {
      setError(err.message || "Failed to generate add-in files");
    },
  });

  // Generate admin add-in mutation
  const generateAdminAddinMutation = useMutation({
    mutationFn: generateAdminAddin,
    onSuccess: (data) => {
      setAdminAddinFiles(data.data);
      setShowAdminAddinFiles(true);
      setError(null);
      
      // Automatically download manifest.xml
      if (data.data?.manifest) {
        const blob = new Blob([data.data.manifest], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "manifest-universal.xml";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
    onError: (err) => {
      setError(err.message || "Failed to generate admin add-in files");
    },
  });

  // Download file helper
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const handleDownloadManifest = () => {
    if (addinFiles?.manifest) {
      downloadFile(addinFiles.manifest, "manifest.xml", "application/xml");
    }
  };

  const handleDownloadJavaScript = () => {
    if (addinFiles?.javascript) {
      downloadFile(addinFiles.javascript, "commands.js", "text/javascript");
    }
  };

  const handleCopyManifestUrl = () => {
    if (addinFiles?.manifestUrl) {
      navigator.clipboard.writeText(addinFiles.manifestUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleOneClickInstall = () => {
    if (addinFiles?.manifestUrl) {
      // Open Outlook Web with the manifest URL
      // Users can paste this URL in Outlook's "Add from URL" option
      const outlookUrl = `https://outlook.office365.com/mail/inclientstore`;
      window.open(outlookUrl, '_blank');
      
      // Also copy the manifest URL to clipboard
      navigator.clipboard.writeText(addinFiles.manifestUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
      
      // Show instructions
      alert(`Installation URL copied to clipboard!\n\n1. Opened Outlook add-in store in a new tab\n2. Go to "Add a custom add-in" → "Add from URL"\n3. Paste the URL: ${addinFiles.manifestUrl}\n4. Click "Add"`);
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

        // Fetch user profile from Graph API
        const response = await loginAPI.getUserProfile(accessToken);

        if (response.success && response.user) {
          const graphUser = response.user;

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
  }, [accessToken]);

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in.");
      }

      const response = await loginAPI.getUserProfile(accessToken);

      if (response.success && response.user) {
        const graphUser = response.user;

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
      backPath="/dashboard"
      backLabel="Back to Dashboard"
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
                {SHOW_ADVANCED_ADDIN_CONTROLS && (
                  <button
                    onClick={() => generateAddinMutation.mutate()}
                    disabled={generateAddinMutation.isPending || !userProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {generateAddinMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4" />
                    )}
                    Generate Add-in
                  </button>
                )}
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
            
            {SHOW_ADVANCED_ADDIN_CONTROLS && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={autoInsert}
                      onChange={(e) => handleToggleAutoInsert(e.target.checked)}
                      disabled={preferencesLoading || updatePreferencesMutation.isPending}
                      className="sr-only"
                    />
                    <div
                      className={`w-14 h-7 rounded-full transition-colors duration-200 ${
                        autoInsert ? "bg-blue-600" : "bg-gray-300"
                      } ${preferencesLoading || updatePreferencesMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                          autoInsert ? "translate-x-7" : "translate-x-1"
                        } mt-0.5`}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Auto-insert signature in all emails
                  </span>
                  {(preferencesLoading || updatePreferencesMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </label>
              </div>
            )}
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

          {SHOW_ADVANCED_ADDIN_CONTROLS && (
          <div className="mx-6 mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Admin: Universal Add-in</h3>
                <p className="text-sm text-purple-700 mt-1">
                  Generate a single add-in that works for all users. Install once as admin, and all users will automatically get their personalized signatures.
                </p>
              </div>
              <button
                onClick={() => generateAdminAddinMutation.mutate()}
                disabled={generateAdminAddinMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {generateAdminAddinMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                Generate Admin Add-in
              </button>
            </div>

            {adminAddinFiles && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <button
                  onClick={() => setShowAdminAddinFiles(!showAdminAddinFiles)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900">Universal Add-in Files</span>
                    <span className="text-sm text-gray-500">(Click to {showAdminAddinFiles ? "hide" : "show"})</span>
                  </div>
                  {showAdminAddinFiles ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {showAdminAddinFiles && (
                  <div className="mt-4 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        One-Click Installation
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        This add-in works for all users. Install it once as admin, and every user will automatically get their personalized signature.
                      </p>
                      <button
                        onClick={() => {
                          if (adminAddinFiles?.manifestUrl) {
                            const outlookUrl = `https://outlook.office365.com/mail/inclientstore`;
                            window.open(outlookUrl, '_blank');
                            navigator.clipboard.writeText(adminAddinFiles.manifestUrl);
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 3000);
                            alert(`Installation URL copied to clipboard!\n\n1. Opened Outlook add-in store in a new tab\n2. Go to "Add a custom add-in" → "Add from URL"\n3. Paste the URL: ${adminAddinFiles.manifestUrl}\n4. Click "Add"`);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Install Admin Add-in in Outlook
                      </button>
                      {copiedUrl && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                          <Check className="w-4 h-4" />
                          Installation URL copied to clipboard!
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Manual Installation</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Copy the manifest URL below and paste it in Outlook's "Add from URL" option:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={adminAddinFiles?.manifestUrl || ""}
                          className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => {
                            if (adminAddinFiles?.manifestUrl) {
                              navigator.clipboard.writeText(adminAddinFiles.manifestUrl);
                              setCopiedUrl(true);
                              setTimeout(() => setCopiedUrl(false), 2000);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy URL
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (adminAddinFiles?.manifest) {
                          downloadFile(adminAddinFiles.manifest, "manifest-universal.xml", "application/xml");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Download manifest.xml
                    </button>

                    {/* Manifest Debugger for Admin Add-in */}
                    <ManifestDebugger 
                      manifestUrl={adminAddinFiles?.manifestUrl}
                      commandsUrl={adminAddinFiles?.commandsUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          )}

          {SHOW_ADVANCED_ADDIN_CONTROLS && addinFiles && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAddinFiles(!showAddinFiles)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Outlook Add-in Files</span>
                  <span className="text-sm text-gray-500">(Click to {showAddinFiles ? "hide" : "show"})</span>
                </div>
                {showAddinFiles ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {showAddinFiles && (
                <div className="mt-4 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      One-Click Installation
                    </h3>
                    <p className="text-sm text-green-800 mb-3">
                      Your add-in files are now hosted on our server. Simply click the button below to install automatically!
                    </p>
                    <button
                      onClick={handleOneClickInstall}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Install Add-in in Outlook
                    </button>
                    {copiedUrl && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                        <Check className="w-4 h-4" />
                        Installation URL copied to clipboard!
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Manual Installation</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      If the one-click install doesn't work, you can install manually:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 mb-3">
                      <li>Open Outlook Web (outlook.office365.com)</li>
                      <li>Navigate to the add-in store (or use the link: <a href="https://outlook.office365.com/mail/inclientstore" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">outlook.office365.com/mail/inclientstore</a>)</li>
                      <li>Click "Add a custom add-in" → "Add from URL"</li>
                      <li>Paste the manifest URL below and click "Add"</li>
                    </ol>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={addinFiles?.manifestUrl || ""}
                        className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={handleCopyManifestUrl}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {copiedUrl ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy URL
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleDownloadManifest}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Download manifest.xml
                    </button>
                    <button
                      onClick={handleDownloadJavaScript}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Download commands.js
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileCode className="w-4 h-4" />
                        manifest.xml
                      </h4>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64 border border-gray-100">
                        <code>{addinFiles.manifest}</code>
                      </pre>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        commands.js
                      </h4>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-64 border border-gray-100">
                        <code>{addinFiles.javascript}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Manifest Debugger */}
                  <ManifestDebugger 
                    manifestUrl={addinFiles?.manifestUrl}
                    commandsUrl={addinFiles?.commandsUrl}
                  />
                </div>
              )}
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
