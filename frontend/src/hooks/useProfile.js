import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  getProfile,
  updateProfile,
  generateShareId,
  syncProfile,
} from "../api/profile";

// Hook to get profile data with aggressive caching
export const useProfile = () => {
  const { user: authUser } = useAuthStore();

  return useQuery({
    queryKey: ["profile", authUser?.id || authUser?.email],
    queryFn: getProfile,
    enabled: !!authUser,
    // Aggressive caching to reduce API calls
    staleTime: 15 * 60 * 1000, // 15 minutes - data stays fresh longer
    cacheTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false, // Don't refetch on network reconnect
    // Only retry once to avoid hammering the API
    retry: 1,
    retryDelay: 2000, // 2 second delay between retries
  });
};

// Hook to sync profile with SSO data - with throttling
export const useSyncProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncProfile,
    // Prevent multiple simultaneous sync calls
    onMutate: async () => {
      // Cancel any outgoing profile queries
      await queryClient.cancelQueries(["profile"]);
    },
    onSuccess: (data) => {
      // Update cache directly instead of invalidating (avoids refetch)
      queryClient.setQueryData(["profile"], data);
    },
    onError: (error) => {
      console.error("Failed to sync profile:", error);
      // Don't invalidate on error to avoid unnecessary refetch
    },
    // Add throttling - only allow one sync per 30 seconds
    retry: false, // Don't retry sync operations
  });
};

// Hook to update profile data with optimistic updates
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    // Optimistic update to avoid immediate refetch
    onMutate: async (newProfileData) => {
      // Cancel outgoing profile queries
      await queryClient.cancelQueries(["profile"]);

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(["profile"]);

      // Optimistically update the cache
      if (previousProfile?.profile) {
        queryClient.setQueryData(["profile"], {
          ...previousProfile,
          profile: { ...previousProfile.profile, ...newProfileData },
        });
      }

      return { previousProfile };
    },
    onError: (error, newProfileData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile"], context.previousProfile);
      }
      console.error("Failed to update profile:", error);
    },
    onSuccess: (data) => {
      // Update with actual server response
      queryClient.setQueryData(["profile"], data);
    },
    retry: 1, // Only retry once
  });
};

// Hook to generate share ID with caching
export const useGenerateShareId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateShareId,
    onMutate: async () => {
      await queryClient.cancelQueries(["profile"]);
    },
    onSuccess: (data) => {
      // Update cache directly
      queryClient.setQueryData(["profile"], data);
    },
    onError: (error) => {
      console.error("Failed to generate share ID:", error);
    },
    retry: 1,
  });
};

// Throttle helper to prevent rapid successive calls
let lastSyncTime = 0;
const SYNC_THROTTLE_MS = 30000; // 30 seconds

// Combined hook for all profile operations with throttling
export const useProfileOperations = () => {
  const profileQuery = useProfile();
  const syncMutation = useSyncProfile();
  const updateMutation = useUpdateProfile();
  const generateShareIdMutation = useGenerateShareId();

  // Throttled sync function
  const throttledSync = () => {
    const now = Date.now();
    if (now - lastSyncTime < SYNC_THROTTLE_MS) {
      console.log("Sync throttled - too recent");
      return;
    }
    lastSyncTime = now;
    syncMutation.mutate();
  };

  // Debounced update function
  let updateTimeout;
  const debouncedUpdate = (data) => {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateMutation.mutateAsync(data);
    }, 500); // 500ms debounce
  };

  return {
    // Query data
    profile: profileQuery.data?.profile,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    // Mutations with throttling/debouncing
    syncProfile: throttledSync,
    updateProfile: updateMutation.mutateAsync, // Keep direct for form submission
    updateProfileDebounced: debouncedUpdate, // For auto-save features
    generateShareId: generateShareIdMutation.mutateAsync,

    // Mutation states
    isSyncing: syncMutation.isPending,
    isUpdating: updateMutation.isPending,
    isGeneratingShareId: generateShareIdMutation.isPending,

    // Error states
    syncError: syncMutation.error,
    updateError: updateMutation.error,
    generateError: generateShareIdMutation.error,

    // Cache utilities
    refreshProfile: () => {
      // Force refresh only when explicitly needed
      profileQuery.refetch();
    },

    // Check if data is stale
    isStale: profileQuery.isStale,

    // Last updated timestamp
    dataUpdatedAt: profileQuery.dataUpdatedAt,
  };
};
