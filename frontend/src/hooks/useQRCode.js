import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQRHistory,
  generateQRCode,
  updateQRCode,
  deleteQRCode,
  getQRAnalytics,
} from "../api/qrcode";

// QR history query
export const useQRHistory = () => {
  return useQuery({
    queryKey: ["qr", "history"],
    queryFn: getQRHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// QR analytics query
export const useQRAnalytics = (qrId) => {
  return useQuery({
    queryKey: ["qr", "analytics", qrId],
    queryFn: () => getQRAnalytics(qrId),
    enabled: !!qrId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Generate QR code mutation
export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr", "history"] });
    },
  });
};

// Update QR code mutation
export const useUpdateQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ qrId, qrData }) => updateQRCode(qrId, qrData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr"] });
    },
  });
};

// Delete QR code mutation
export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qr", "history"] });
    },
  });
};
