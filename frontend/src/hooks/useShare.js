import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  getSharedProfile,
  trackWebsiteView,
  trackDownload,
} from "../api/share";

// Hook to get shared profile data
export const useSharedProfile = () => {
  const { id } = useParams();

  return useQuery({
    queryKey: ["shared-profile", id],
    queryFn: () => getSharedProfile(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};



// Hook to track website views
export const useTrackWebsiteView = () => {
  return useMutation({
    mutationFn: ({ shareId, metadata }) => trackWebsiteView(shareId, metadata),
    onError: (error) => {
      console.error("Failed to track website view:", error);
    },
  });
};

// Hook to track downloads
export const useTrackDownload = () => {
  return useMutation({
    mutationFn: ({ shareId, downloadType, metadata }) =>
      trackDownload(shareId, downloadType, metadata),
    onSuccess: (data, variables) => {
      console.log("✅ Download tracked successfully:", variables.downloadType);
    },
    onError: (error) => {
      console.error("Failed to track download:", error);
    },
  });
};
