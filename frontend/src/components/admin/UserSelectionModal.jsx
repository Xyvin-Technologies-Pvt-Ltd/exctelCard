import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAllEntraUsers, assignUsersToApp } from "../../api/users";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { FaSearch, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const UserSelectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [nextSkipToken, setNextSkipToken] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from Entra ID
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["entra-users", debouncedSearchQuery],
    queryFn: () => getAllEntraUsers(debouncedSearchQuery, null),
    enabled: isOpen,
    retry: 1,
  });

  // Update users list when data changes
  useEffect(() => {
    if (usersData?.data?.users) {
      setAllUsers(usersData.data.users);
      setNextSkipToken(usersData.data.nextSkipToken || null);
    }
  }, [usersData]);

  // Load more users (pagination)
  const loadMoreUsers = useCallback(async () => {
    if (!nextSkipToken || isLoading) return;

    try {
      const response = await getAllEntraUsers(debouncedSearchQuery, nextSkipToken);
      if (response?.data?.users) {
        setAllUsers((prev) => [...prev, ...response.data.users]);
        setNextSkipToken(response.data.nextSkipToken || null);
      }
    } catch (error) {
      console.error("Failed to load more users:", error);
      toast.error("Failed to load more users");
    }
  }, [nextSkipToken, debouncedSearchQuery, isLoading]);

  // Handle user selection
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Select all users
  const selectAll = () => {
    const unassignedUsers = allUsers.filter((user) => !user.isAssigned);
    setSelectedUsers(new Set(unassignedUsers.map((user) => user.id)));
  };

  // Deselect all users
  const deselectAll = () => {
    setSelectedUsers(new Set());
  };

  // Handle assign users
  const handleAssignUsers = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsAssigning(true);
    try {
      const userIds = Array.from(selectedUsers);
      const response = await assignUsersToApp(userIds);

      if (response.success) {
        const { stats } = response.data;
        const successCount = stats.assigned + stats.alreadyAssigned;
        
        if (stats.failed === 0) {
          toast.success(
            `Successfully assigned ${successCount} user(s) to the application`
          );
        } else {
          toast.success(
            `Assigned ${successCount} user(s), ${stats.failed} failed`,
            { duration: 5000 }
          );
        }

        // Reset selection and close modal
        setSelectedUsers(new Set());
        setSearchQuery("");
        setDebouncedSearchQuery("");
        
        // Refetch users list
        await refetch();
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      }
    } catch (error) {
      console.error("Failed to assign users:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign users to application"
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSelectedUsers(new Set());
      setAllUsers([]);
      setNextSkipToken(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Users from Entra ID</h2>
            <p className="text-sm text-gray-600 mt-1">
              Search and select users to add to the application
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isAssigning}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={<FaSearch className="w-4 h-4" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={selectAll}
                disabled={isLoading || isAssigning}
              >
                Select All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={deselectAll}
                disabled={isLoading || isAssigning || selectedUsers.size === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>
          
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                <strong>{selectedUsers.size}</strong> user(s) selected
              </span>
              <Button
                variant="primary"
                onClick={handleAssignUsers}
                loading={isAssigning}
                disabled={isAssigning}
              >
                {isAssigning ? "Assigning..." : `Add ${selectedUsers.size} User(s)`}
              </Button>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && allUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="w-6 h-6 animate-spin text-primary-500 mr-3" />
              <span className="text-gray-600">Loading users...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                Failed to load users: {error.message}
              </p>
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {allUsers.map((user) => {
                  const isSelected = selectedUsers.has(user.id);
                  const isAssigned = user.isAssigned;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                        isSelected
                          ? "bg-primary-50 border-primary-300"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      } ${isAssigned ? "opacity-60" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection(user.id)}
                        disabled={isAssigned || isAssigning}
                        className="w-5 h-5 text-primary-500 rounded border-gray-300 focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {user.displayName}
                          </p>
                          {isAssigned && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Already Added
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {user.email}
                        </p>
                        {user.jobTitle && (
                          <p className="text-xs text-gray-500 truncate">
                            {user.jobTitle}
                            {user.department && ` • ${user.department}`}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <FaCheck className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {nextSkipToken && (
                <div className="mt-4 text-center">
                  <Button
                    variant="secondary"
                    onClick={loadMoreUsers}
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Load More Users
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;

