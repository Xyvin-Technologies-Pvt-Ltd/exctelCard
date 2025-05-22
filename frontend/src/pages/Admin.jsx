import React, { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ActivityViewPopup from "../components/ActivityViewPopup"; 

// Sample user data with activity stats
const sampleUsers = [
  {
    _id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    department: "Engineering",
    jobTitle: "Software Engineer",
    lastLogin: "2025-05-18T10:30:00Z",
    isActive: true,
    profileImage: null,
    activity: { total: 23, websiteView: 2, cardScan: 5, cardDownloads: 10 },
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    department: "Marketing",
    jobTitle: "Marketing Manager",
    lastLogin: "2025-05-17T14:15:00Z",
    isActive: false,
    profileImage: null,
    activity: { total: 15, websiteView: 3, cardScan: 4, cardDownloads: 8 },
  },
];

const Admin = () => {
  // State for tab switching
  const [activeTab, setActiveTab] = useState("users");
  // State for SSO configuration
  const [isConfiguring, setIsConfiguring] = useState(false);
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

  // Save SSO configuration (mock function for now)
  const saveSsoConfiguration = () => {
    setIsConfiguring(false);
    alert(
      "SSO configuration saved! (This is a demo - no actual changes are being made)"
    );
    console.log("SSO Configuration:", ssoConfig);
  };

  // Handle opening the popup
  const openPopup = (activity) => {
    setSelectedActivity(activity);
    setIsPopupOpen(true);
  };

  // Handle closing the popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedActivity(null);
  };

  return (
    <div className="space-y-8">
      <div className="mb-5 text-left">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("sso")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sso"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            SSO Configuration
          </button>
        </nav>
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="input pr-10"
                value=""
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
                    Department
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Job Title
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
                {sampleUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-left">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-200 flex items-center justify-center">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-primary-800 font-medium">
                              {user.name.charAt(0).toUpperCase()}
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
                      {user.department}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                      {user.jobTitle}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-left">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => openPopup(user.activity)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <MdOutlineRemoveRedEye />
                      </button>
                    </td>
                  </tr>
                ))}
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
              <h2 className="text-xl font-semibold text-left">SSO Configuration</h2>
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
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
                  <div className="rounded-full bg-primary-100 p-3 mr-3">
                    <svg
                      className="h-6 w-6 text-primary-600"
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
            <h2 className="text-xl font-semibold mb-4 text-left">User Provisioning</h2>
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
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
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

      {/* Render the ActivityViewPopup */}
      <ActivityViewPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        activityData={selectedActivity || { total: 0, websiteView: 0, cardScan: 0, cardDownloads: 0 }}
      />
    </div>
  );
};

export default Admin;