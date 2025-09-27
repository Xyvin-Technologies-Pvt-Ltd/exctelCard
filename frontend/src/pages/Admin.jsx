import React, { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import ActivityViewPopup from "../components/ActivityViewPopup";
import QRCodeWithLogo from "../components/QRCodeWithLogo";
import { getUsers, getUserActivity, searchUsers } from "../api/users";
import qrCodeBackgroundService from "../services/qrCodeBackgroundService";
import { downloadQRBackEnd } from "../api/qrcode";


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
                           <img src={user.qrCode?.dataUrl} alt="QR Code" style={{width: "40px", height: "40px"}} />
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
