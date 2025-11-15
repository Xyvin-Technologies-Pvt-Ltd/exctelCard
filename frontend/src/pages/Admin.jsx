import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";
import ActivityViewPopup from "../components/ActivityViewPopup";
import QRCodeWithLogo from "../components/QRCodeWithLogo";
import AdminSignatureManager from "../components/admin/AdminSignatureManager";
import { getUsers, getUserActivity, searchUsers } from "../api/users";
import qrCodeBackgroundService from "../services/qrCodeBackgroundService";
import { downloadQRBackEnd } from "../api/qrcode";
import { autoSyncUsers } from "../api/auth";
import { getAllConfigsAdmin, createConfigAdmin } from "../api/outlook-signature.api";

const Admin = () => {
  // Query client for refetching
  const queryClient = useQueryClient();

  // State for tab switching
  const [activeTab, setActiveTab] = useState("users");
  // State for SSO configuration
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [ssoConfig, setSsoConfig] = useState({
    provider: "microsoft",
    clientId: "",
    clientSecret: "",
    tenantId: "",
    redirectUri: window.location.origin,
    autoProvisioning: true,
    defaultRole: "employee",
  });
  // State for popup visibility and selected user's activity data
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Refs for QR codes - create a map to store refs for each user
  const qrRefs = useRef({});

  // State for QR generation status
  const [qrGenerationStatus, setQrGenerationStatus] = useState({});
  const [isQrGenerating, setIsQrGenerating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // State for visible QR codes (lazy loading)
  const [visibleQRCodes, setVisibleQRCodes] = useState(new Set());

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users with TanStack Query
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", debouncedSearchQuery],
    queryFn: () =>
      debouncedSearchQuery ? searchUsers(debouncedSearchQuery) : getUsers(),
  });

  // Fetch user activity when popup is opened
  const { data: activityData } = useQuery({
    queryKey: ["userActivity", selectedActivity?.userId],
    queryFn: () => getUserActivity(selectedActivity?.userId),
    enabled: !!selectedActivity?.userId,
  });

  // Monitor QR generation status
  useEffect(() => {
    const updateQrStatus = () => {
      setIsQrGenerating(qrCodeBackgroundService.isGenerationInProgress());

      if (usersData?.users) {
        const statusMap = {};
        usersData.users.forEach((user) => {
          statusMap[user._id] = qrCodeBackgroundService.getStatus(user._id);
        });
        setQrGenerationStatus(statusMap);
      }
    };

    // Update status immediately
    updateQrStatus();

    // Set up interval to check status periodically
    const interval = setInterval(updateQrStatus, 2000);

    return () => clearInterval(interval);
  }, [usersData?.users]);

  // Intersection Observer for lazy loading QR codes
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const userId = entry.target.dataset.userId;
            if (userId) {
              setVisibleQRCodes((prev) => new Set([...prev, userId]));
            }
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before the element comes into view
        threshold: 0.1,
      }
    );

    // Observe all QR code containers
    const qrContainers = document.querySelectorAll("[data-qr-container]");
    qrContainers.forEach((container) => observer.observe(container));

    return () => {
      qrContainers.forEach((container) => observer.unobserve(container));
    };
  }, [usersData?.users]);

  // Static formatDate function
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle opening the popup
  const openPopup = async (userId) => {
    setSelectedActivity({ userId });
  };

  // Handle closing the popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedActivity(null);
  };
  // Default HTML template - Outlook compatible with inline styles
  const DEFAULT_TEMPLATE = `<!--[if mso]>
<style type="text/css">
@font-face{font-family:"AktivGrotesk";src:url("https://cdn-ileaolp.nitrocdn.com/XyERqqlzUUUQQwlWmuaJLVHDbQgsqGcu/assets/static/source/rev-0cb01a5/betasite.exctel.com/wp-content/uploads/2025/03/AktivGrotesk-Regular.otf") format("opentype");font-weight:400;font-style:normal;font-display:swap}
body, table, td, a { font-family: "AktivGrotesk", Arial, sans-serif !important; }
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
<tr><td style="width:20px;padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=blLagk1rxZGp&format=png&color=000000" alt="Email" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif"><a href="mailto:%%Email%%" style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif">%%Email%%</span></a></td></tr>
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif"><a href="tel:%%MobileNumber%%" style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif">%%MobileNumber%%</span></a></td></tr>
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=100&id=11471&format=png&color=000000" alt="Mobile2" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif"><a href="fax:%%FaxNumber%%" style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif">%%FaxNumber%%</span></a></td></tr>
<tr><td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/?size=200&id=pjumbCENHfje&format=png&color=000000" alt="Landline" width="14" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif"><a href="tel:%%PhoneNumber%%" style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#333;text-decoration:none;font-family:'AktivGrotesk',Arial,sans-serif">%%PhoneNumber%%</span></a></td></tr>
<tr><td style="padding-right:8px;vertical-align:top;font-family:'AktivGrotesk',Arial,sans-serif"><img src="https://img.icons8.com/ios-filled/50/000000/marker.png" alt="Address" width="12" height="14" style="display:block;border:none;outline:none"></td><td style="font-family:'AktivGrotesk',Arial,sans-serif;color:#333">%%Street%%</td></tr>
</table>
</td>
</tr></table>
<table width="600" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid #ff8331;line-height:0;font-size:0;margin:2px;padding:0">&nbsp;</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:14px;width:500px;margin-top:10px">
<tr><td style="width:180px;padding-right:20px;font-family:'AktivGrotesk',Arial,sans-serif"><a href="https://www.exctel.com" target="_blank" style="color:#000;text-decoration:none;font-weight:bold;font-family:'AktivGrotesk',Arial,sans-serif"><span style="color:#000;text-decoration:none;font-weight:bold;font-family:'AktivGrotesk',Arial,sans-serif">www.exctel.com</span></a></td>
<td style="padding-left:20px;font-family:'AktivGrotesk',Arial,sans-serif">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><a href="https://linkedin.com/company/exctel" target="_blank" style="text-decoration:none"><img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" width="20" height="20" alt="LinkedIn" style="display:block;border:none;outline:none;text-decoration:none"></a></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><a href="https://x.com/ExctelEngg" target="_blank" style="text-decoration:none"><img src="https://www.freeiconspng.com/uploads/new-x-twitter-logo-png-photo-1.png" width="20" height="20" alt="X" style="display:block;border:none;outline:none;text-decoration:none"></a></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><a href="https://facebook.com/exctel" target="_blank" style="text-decoration:none"><img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="20" height="20" alt="Facebook" style="display:block;border:none;outline:none;text-decoration:none"></a></td>
<td style="padding-right:8px;font-family:'AktivGrotesk',Arial,sans-serif"><a href="https://www.instagram.com/exctelglobal" target="_blank" style="text-decoration:none"><img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="20" height="20" alt="Instagram" style="display:block;border:none;outline:none;text-decoration:none"></a></td>
</tr></table>
</td></tr></table>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:'AktivGrotesk',Arial,sans-serif;font-size:9px;line-height:1.4;color:#333;width:600px;margin-top:10px">
<tr><td style="padding-top:10px;font-style:italic;color:#555;text-align:justify;font-family:'AktivGrotesk',Arial,sans-serif">
    This email and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, please delete this message, notify the sender immediately, and note that any review, use, disclosure, or distribution of its contents is strictly prohibited. We accept no liability for any errors, delays, or security issues that may arise during the transmission of this email.
</td></tr></table>`;

  const syncUsers = async () => {
    try {
      setIsSyncing(true);
      
      // Step 1: Sync users from Azure AD
      await autoSyncUsers();

      // Step 2: Refetch users data
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Step 3: Fetch updated users list
      const updatedUsersResponse = await getUsers();
      const updatedUsers = updatedUsersResponse?.users || [];

      // Step 4: Fetch current signature configs
      const configsResponse = await getAllConfigsAdmin();
      const currentConfigs = configsResponse?.data || [];

      // Step 5: Identify users without signatures
      const usersWithoutSignatures = updatedUsers.filter(user => {
        const userEmail = user.email || user._id;
        return !currentConfigs.some(config => config.user_id === userEmail || config.user_id === user._id);
      });

      // Step 6: Create signatures for users who don't have them
      if (usersWithoutSignatures.length > 0) {
        const createPromises = usersWithoutSignatures.map(user => {
          const userId = user.email || user._id;
          return createConfigAdmin({
            user_id: userId,
            signature_name: `${user.name || user.email}'s Signature`,
            html_template: DEFAULT_TEMPLATE,
            description: "Auto-generated during user sync",
            is_active: true,
          });
        });

        await Promise.all(createPromises);
        
        // Step 7: Invalidate signature configs query
        await queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
        
        toast.success(`Users synced successfully. Created ${usersWithoutSignatures.length} signature(s) for users without them.`);
      } else {
        toast.success("Users synced successfully. All users already have signatures.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to sync users");
    } finally {
      setIsSyncing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading users: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-white min-h-screen p-6">
      <div className="mb-5 text-left flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users and configure system settings
          </p>
        </div>
        <button
          className="bg-primary-500 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => syncUsers()}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FaSync className="w-4 h-4 mr-2" />
          )}
          Sync Users
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("signatures")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "signatures"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            Outlook Signatures
          </button>
        </nav>
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">User Management</h2>
              {isQrGenerating && (
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <FaSpinner className="w-3 h-3 mr-2 animate-spin" />
                  Generating QR codes in background... (
                  {qrCodeBackgroundService.getOverallProgress()}%)
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="input pr-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-16 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Job Title
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-40"
                  >
                    QR Code
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Share ID
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Activity View
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData?.users?.map((user) => {
                  // Get or create ref for this user
                  if (!qrRefs.current[user._id]) {
                    qrRefs.current[user._id] = { current: null };
                  }
                  const qrRef = qrRefs.current[user._id];

                  return (
                    <tr key={user._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <span className="text-gray-800 font-medium">
                                {user.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-3 flex flex-col justify-center">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                        {user.phone || "N/A"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                        {user.jobTitle || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-left">
                        {user.shareId && user.shareId !== "" ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={user.qrCode?.dataUrl}
                              alt="QR Code"
                              style={{ width: "40px", height: "40px" }}
                            />
                            <button
                              onClick={() => downloadQRBackEnd(user.shareId)}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download QR Code"
                            >
                              <FaDownload className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No QR Code
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            window.open(
                              `${window.location.protocol}//${window.location.hostname}/share/${user.shareId}`,
                              "_blank"
                            );
                          }}
                        >
                          <FaExternalLinkAlt />
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                        {formatDate(user.lastActiveAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => openPopup(user._id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <MdOutlineRemoveRedEye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Outlook Signatures Tab */}
      {activeTab === "signatures" && (
        <AdminSignatureManager />
      )}

      {/* Activity View Popup */}
      <ActivityViewPopup
        isOpen={!!selectedActivity}
        onClose={closePopup}
        activityData={
          activityData || {
            total: 0,
            websiteView: 0,
            vcardDownloads: 0,
            cardDownloads: 0,
          }
        }
      />
    </div>
  );
};

export default Admin;
