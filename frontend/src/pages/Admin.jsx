import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  FaDownload,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import ActivityViewPopup from "../components/ActivityViewPopup";
import QRCodeWithLogo from "../components/QRCodeWithLogo";
import { getUsers, getUserActivity, searchUsers } from "../api/users";
import qrCodeBackgroundService from "../services/qrCodeBackgroundService";

const Admin = () => {
  // State for tab switching
  const [activeTab, setActiveTab] = useState("users");
  // State for SSO configuration
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // State for visible QR codes (lazy loading)
  const [visibleQRCodes, setVisibleQRCodes] = useState(new Set());

  // Fetch users with TanStack Query
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => (searchQuery ? searchUsers(searchQuery) : getUsers()),
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

  // Handle SSO config changes
  const handleSsoConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSsoConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save SSO configuration
  const saveSsoConfiguration = () => {
    setIsConfiguring(false);
    // TODO: Implement actual SSO configuration save
    console.log("SSO Configuration:", ssoConfig);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Get QR generation status icon
  const getQrStatusIcon = (userId) => {
    const status = qrGenerationStatus[userId];
    if (!status) return null;

    switch (status.status) {
      case "generating":
        return <FaSpinner className="w-3 h-3 text-blue-500 animate-spin" />;
      case "completed":
        return <FaCheck className="w-3 h-3 text-green-500" />;
      case "error":
        return <FaExclamationTriangle className="w-3 h-3 text-red-500" />;
      case "skipped":
        return <FaExclamationTriangle className="w-3 h-3 text-yellow-500" />;
      default:
        return null;
    }
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

  // Download QR code for a specific user
  const downloadUserQR = async (user) => {
    try {
      console.log("Starting QR code download for user:", user.name);

      const qrRef = qrRefs.current[user._id];
      if (!qrRef) {
        console.error("QR ref not found for user:", user._id);
        return;
      }

      const qrContainer = qrRef.current;
      console.log("QR container found:", qrContainer);

      if (!qrContainer) {
        console.error("QR container not found");
        return;
      }

      // Use html2canvas to capture the QR code
      const html2canvas = (await import("html2canvas")).default;

      const canvas = await html2canvas(qrContainer, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: true,
      });

      console.log("Canvas generated successfully");

      // Download the image
      const link = document.createElement("a");
      const fileName = `${
        user.name?.toLowerCase().replace(/\s+/g, "_") || "user"
      }-qr-code.png`;
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Download initiated for:", fileName);
    } catch (error) {
      console.error("Error downloading QR code:", error);
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
      <div className="mb-5 text-left">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users and configure system settings
        </p>
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
                            <div
                              className="relative"
                              data-qr-container
                              data-user-id={user._id}
                            >
                              {visibleQRCodes.has(user._id) ? (
                                <QRCodeWithLogo
                                  ref={qrRef}
                                  value={`${window.location.protocol}//${window.location.hostname}/share/${user.shareId}`}
                                  size={120}
                                  logoSize={30}
                                  logoPath="/logo.png"
                                  level="H"
                                  bgColor="#FFFFFF"
                                  fgColor="#000000"
                                  frameStyle="none"
                                  className="inline-block"
                                />
                              ) : (
                                <div
                                  className="bg-gray-100 rounded-lg flex items-center justify-center"
                                  style={{ width: 120, height: 120 }}
                                >
                                  <FaSpinner className="w-6 h-6 text-gray-400 animate-spin" />
                                </div>
                              )}
                              {/* QR Generation Status Overlay */}
                              <div className="absolute top-1 right-1">
                                {getQrStatusIcon(user._id)}
                              </div>
                            </div>
                            <button
                              onClick={() => downloadUserQR(user)}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download QR Code"
                              disabled={
                                !qrCodeBackgroundService.isQRCodeGenerated(
                                  user._id
                                ) || !visibleQRCodes.has(user._id)
                              }
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

      {/* SSO Configuration Tab */}
      {activeTab === "sso" && (
        <div className="space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-left">
                SSO Configuration
              </h2>
              <div>
                {!isConfiguring && (
                  <Button
                    variant="primary"
                    onClick={() => setIsConfiguring(true)}
                  >
                    Configure SSO
                  </Button>
                )}
              </div>
            </div>

            {isConfiguring ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      SSO Provider
                    </label>
                    <select
                      name="provider"
                      value={ssoConfig.provider}
                      onChange={handleSsoConfigChange}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="microsoft">Microsoft Entra ID</option>
                      <option value="google">Google Workspace</option>
                      <option value="okta">Okta</option>
                      <option value="auth0">Auth0</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Client ID
                    </label>
                    <input
                      type="text"
                      name="clientId"
                      value={ssoConfig.clientId}
                      onChange={handleSsoConfigChange}
                      placeholder="Enter client ID"
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      name="clientSecret"
                      value={ssoConfig.clientSecret}
                      onChange={handleSsoConfigChange}
                      placeholder="Enter client secret"
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      name="tenantId"
                      value={ssoConfig.tenantId}
                      onChange={handleSsoConfigChange}
                      placeholder="Enter tenant ID"
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Redirect URI
                    </label>
                    <input
                      type="text"
                      name="redirectUri"
                      value={ssoConfig.redirectUri}
                      onChange={handleSsoConfigChange}
                      placeholder="Enter redirect URI"
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                      Default Role
                    </label>
                    <select
                      name="defaultRole"
                      value={ssoConfig.defaultRole}
                      onChange={handleSsoConfigChange}
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input
                    id="autoProvisioning"
                    name="autoProvisioning"
                    type="checkbox"
                    checked={ssoConfig.autoProvisioning}
                    onChange={handleSsoConfigChange}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="autoProvisioning"
                    className="ml-2 block text-sm text-gray-700 text-left"
                  >
                    Enable auto-provisioning for new users
                  </label>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setIsConfiguring(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveSsoConfiguration}>
                    Save Configuration
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-md">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-gray-100 p-3 mr-3">
                    <svg
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900">
                      Single Sign-On
                    </h3>
                    <p className="text-gray-500">
                      Configure SSO authentication for your organization
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border border-gray-200 rounded-md text-left">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Microsoft Entra ID
                    </h4>
                    <p className="text-gray-500 text-sm mb-3">
                      Connect with Microsoft Entra ID (formerly Azure AD) for
                      seamless integration with Microsoft 365
                    </p>
                    <span className="text-xs text-gray-500">
                      Status: Not configured
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-left">
                  Configure SSO to enable seamless login for your users and
                  reduce password fatigue. We support various identity
                  providers, including Microsoft Entra ID, Google Workspace,
                  Okta, and more.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4 text-left">
              User Provisioning
            </h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4 text-left">
                Choose how new users are added to the system and what default
                permissions they receive.
              </p>
              <div className="py-4">
                <div className="flex items-start mt-4">
                  <div className="flex items-center h-5">
                    <input
                      id="autoProvisioning"
                      name="provisioning"
                      type="radio"
                      className="h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                    />
                  </div>
                  <div className="ml-3 text-sm text-left">
                    <label
                      htmlFor="autoProvisioning"
                      className="font-medium text-gray-700"
                    >
                      Auto Provisioning
                    </label>
                    <p className="text-gray-500">
                      Users are automatically created when they authenticate via
                      SSO
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="primary">Save Settings</Button>
            </div>
          </Card>
        </div>
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
