import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllConfigsAdmin, 
  deleteConfigAdmin,
  createConfigAdmin
} from "../../api/outlook-signature.api";
import { getUsers } from "../../api/users";
import { 
  Loader2, 
  Edit, 
  Trash2,
  Plus,
  X,
  Eye
} from "lucide-react";
import SignaturePreviewModal from "./SignaturePreviewModal";

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

const AdminSignatureManager = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [previewConfig, setPreviewConfig] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Fetch all signature configs
  const { data: configsData, isLoading: configsLoading, error: configsError } = useQuery({
    queryKey: ["admin-signature-configs"],
    queryFn: getAllConfigsAdmin,
    retry: 1,
  });

  // Fetch all users
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Debug logging
  useEffect(() => {
    if (configsData) {
      console.log("Configs data received:", configsData);
      console.log("Configs array:", configsData?.data || []);
    }
    if (configsError) {
      console.error("Configs error:", configsError);
    }
  }, [configsData, configsError]);

  // Delete config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: deleteConfigAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
    },
  });

  // Create config mutation
  const createConfigMutation = useMutation({
    mutationFn: createConfigAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
      setShowCreateForm(false);
      setSelectedUserId("");
      setSignatureName("");
    },
  });

  // Bulk create for all users without signatures
  const bulkCreateMutation = useMutation({
    mutationFn: async () => {
      const currentConfigs = configsData?.data || [];
      const currentUsers = usersData?.users || [];
      
      const usersWithoutSignatures = currentUsers.filter(user => {
        const userEmail = user.email || user._id;
        return !currentConfigs.some(config => config.user_id === userEmail || config.user_id === user._id);
      });

      const promises = usersWithoutSignatures.map(user => {
        const userId = user.email || user._id;
        return createConfigAdmin({
          user_id: userId,
          signature_name: `${user.name || user.email}'s Signature`,
          html_template: DEFAULT_TEMPLATE,
          description: "Auto-generated by admin",
          is_active: true,
        });
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
    },
  });

  const handleCreateSignature = () => {
    if (!selectedUserId) {
      alert("Please select a user");
      return;
    }

    createConfigMutation.mutate({
      user_id: selectedUserId,
      signature_name: signatureName || "My Signature",
      html_template: DEFAULT_TEMPLATE,
      description: "Created by admin",
      is_active: true,
    });
  };

  const handleBulkCreate = () => {
    const currentUsers = usersData?.users || [];
    const currentConfigs = configsData?.data || [];
    const usersWithoutSignatures = currentUsers.filter(user => {
      const userEmail = user.email || user._id;
      return !currentConfigs.some(config => config.user_id === userEmail || config.user_id === user._id);
    });
    
    if (usersWithoutSignatures.length === 0) {
      alert("All users already have signatures!");
      return;
    }
    
    if (window.confirm(`This will create signatures for ${usersWithoutSignatures.length} users without signatures. Continue?`)) {
      bulkCreateMutation.mutate();
    }
  };


  const getUserEmail = (userId) => {
    const currentUsers = usersData?.users || [];
    const user = currentUsers.find(u => u.email === userId || u._id === userId);
    return user?.email || userId;
  };

  const getUserName = (userId) => {
    const currentUsers = usersData?.users || [];
    const user = currentUsers.find(u => u.email === userId || u._id === userId);
    return user?.name || userId;
  };

  // Get users without signatures
  const usersWithoutSignatures = (usersData?.users || []).filter(user => {
    const userEmail = user.email || user._id;
    const currentConfigs = configsData?.data || [];
    return !currentConfigs.some(config => config.user_id === userEmail || config.user_id === user._id);
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outlook Signature Management</h2>
            <p className="text-gray-600 mt-1">
              View and manage email signatures for all users
            </p>
          </div>
          <div className="flex items-center gap-3">
            {usersWithoutSignatures.length > 0 && (
              <button
                onClick={handleBulkCreate}
                disabled={bulkCreateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {bulkCreateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create for All Users ({usersWithoutSignatures.length})
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Signature
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Signature for User</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedUserId("");
                  setSignatureName("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a user --</option>
                  {(usersData?.users || []).map((user) => (
                    <option key={user._id || user.email} value={user.email || user._id}>
                      {user.name || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Name
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="My Signature"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateSignature}
                  disabled={!selectedUserId || createConfigMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createConfigMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Create Signature"
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSelectedUserId("");
                    setSignatureName("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Signatures List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Signatures ({(configsData?.data || []).length} total)
          </h3>

          {configsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : configsError ? (
            <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 font-medium mb-2">Error loading signature configurations</p>
              <p className="text-red-600 text-sm">
                {configsError.response?.data?.message || configsError.message || "Failed to fetch signature configurations"}
              </p>
              {configsError.response?.status === 403 && (
                <p className="text-red-600 text-sm mt-2">You may not have admin permissions to view this data.</p>
              )}
            </div>
          ) : (configsData?.data || []).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 mb-2">No signature configurations found</p>
              <p className="text-gray-400 text-sm mb-4">Create signatures for users using the "Create Signature" button above</p>
              {(usersData?.users || []).length > 0 && (
                <button
                  onClick={handleBulkCreate}
                  disabled={bulkCreateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {bulkCreateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating signatures...
                    </span>
                  ) : (
                    `Create Signatures for All ${(usersData?.users || []).length} Users`
                  )}
                </button>
              )}
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
                  {(configsData?.data || []).map((config) => (
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
                              setPreviewConfig(config);
                              setIsPreviewModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Preview Modal */}
      <SignaturePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewConfig(null);
        }}
        config={previewConfig}
        userName={previewConfig ? getUserName(previewConfig.user_id) : null}
        userEmail={previewConfig ? getUserEmail(previewConfig.user_id) : null}
      />
    </div>
  );
};

export default AdminSignatureManager;

