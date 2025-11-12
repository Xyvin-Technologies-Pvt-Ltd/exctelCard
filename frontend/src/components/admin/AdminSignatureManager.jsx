import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllConfigsAdmin, 
  createConfigAdmin, 
  updateConfigAdmin, 
  deleteConfigAdmin,
  generateAdminAddin,
  generatePreview
} from "../../api/outlook-signature.api";
import { getUsers } from "../../api/users";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Code, 
  ExternalLink,
  Copy,
  Check,
  FileCode,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import ManifestDebugger from "../outlook/ManifestDebugger";

const AdminSignatureManager = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddinFiles, setShowAddinFiles] = useState(false);
  const [adminAddinFiles, setAdminAddinFiles] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fetch all signature configs
  const { data: configsData, isLoading: configsLoading } = useQuery({
    queryKey: ["admin-signature-configs"],
    queryFn: getAllConfigsAdmin,
  });

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const configs = configsData?.data || [];
  const users = usersData?.users || [];

  // Group configs by user
  const configsByUser = configs.reduce((acc, config) => {
    if (!acc[config.user_id]) {
      acc[config.user_id] = [];
    }
    acc[config.user_id].push(config);
    return acc;
  }, {});

  // Generate admin add-in mutation
  const generateAdminAddinMutation = useMutation({
    mutationFn: generateAdminAddin,
    onSuccess: (data) => {
      setAdminAddinFiles(data.data);
      setShowAddinFiles(true);
      
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
  });

  // Delete config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: deleteConfigAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
    },
  });

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

  const handleCopyManifestUrl = () => {
    if (adminAddinFiles?.manifestUrl) {
      navigator.clipboard.writeText(adminAddinFiles.manifestUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.email === userId || u._id === userId);
    return user?.email || userId;
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.email === userId || u._id === userId);
    return user?.name || userId;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outlook Signature Management</h2>
            <p className="text-gray-600 mt-1">
              Manage email signatures for all users and generate universal add-in
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
            Generate Universal Add-in
          </button>
        </div>

        {/* Universal Add-in Section */}
        {adminAddinFiles && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <button
              onClick={() => setShowAddinFiles(!showAddinFiles)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">Universal Add-in Files</span>
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
                    Installation Instructions
                  </h3>
                  <p className="text-sm text-green-800 mb-3">
                    This universal add-in works for all users. Install it once as admin, and every user will automatically get their personalized signature.
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
                    Install Universal Add-in
                  </button>
                  {copiedUrl && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                      <Check className="w-4 h-4" />
                      Installation URL copied to clipboard!
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Manifest URL</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={adminAddinFiles?.manifestUrl || ""}
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
                          Copy
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

                <ManifestDebugger 
                  manifestUrl={adminAddinFiles?.manifestUrl}
                  commandsUrl={adminAddinFiles?.commandsUrl}
                />
              </div>
            )}
          </div>
        )}

        {/* User Signatures List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Signatures ({configs.length} total)
          </h3>

          {configsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No signature configurations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Signature Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs.map((config) => (
                    <tr key={config._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getUserName(config.user_id)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getUserEmail(config.user_id)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{config.signature_name}</div>
                        {config.description && (
                          <div className="text-xs text-gray-500">{config.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            config.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {config.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(config.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              // TODO: Implement edit functionality
                              alert("Edit functionality coming soon");
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this signature configuration?")) {
                                deleteConfigMutation.mutate(config._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                            disabled={deleteConfigMutation.isPending}
                          >
                            {deleteConfigMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSignatureManager;

