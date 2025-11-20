import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllConfigsAdmin, 
  deleteConfigAdmin,
  migrateAllTemplates
} from "../../api/outlook-signature.api";
import { getUsers } from "../../api/users";
import { 
  Loader2, 
  Edit, 
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";
import SignaturePreviewModal from "./SignaturePreviewModal";

const AdminSignatureManager = () => {
  const queryClient = useQueryClient();
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

  // Migrate templates mutation
  const migrateTemplatesMutation = useMutation({
    mutationFn: migrateAllTemplates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signature-configs"] });
    },
  });


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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Outlook Signature Management</h2>
            <p className="text-gray-600 mt-1">
              View and manage email signatures for all users
            </p>
          </div>
          <button
            onClick={() => migrateTemplatesMutation.mutate()}
            disabled={migrateTemplatesMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Update all signatures to hide empty fields"
          >
            {migrateTemplatesMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Fix Empty Fields
          </button>
        </div>

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
              <p className="text-gray-400 text-sm mb-4">Use the "Sync Users" button to automatically create signatures for all users</p>
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

