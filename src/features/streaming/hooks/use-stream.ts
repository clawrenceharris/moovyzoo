import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { streamService, StreamService } from "../domain/stream.service";
import type { StreamDashboardData } from "../domain/stream.types";
import { streamQueryKeys } from "./use-stream-queries";

// Create service instance - can be mocked in tests
const createStreamingService = () => new StreamService();

/**
 * Hook to get streaming session dashboard data
 */
export function useStreamDashboard(streamId: string, userId: string) {
  return useQuery({
    queryKey: streamQueryKeys.dashboard(streamId, userId),
    queryFn: () =>
      createStreamingService().getStreamingDashboard(streamId, userId),
    enabled: !!streamId && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

/**
 * Hook to join a streaming session
 */
export function useJoinStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streamId, userId }: { streamId: string; userId: string }) =>
      streamService.joinStream(streamId, userId),
    onSuccess: (_, { streamId, userId }) => {
      // Invalidate and refetch streaming session data
      queryClient.invalidateQueries({
        queryKey: streamQueryKeys.dashboard(streamId, userId),
      });
    },
  });
}

/**
 * Hook to leave a streaming session
 */
export function useLeaveStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ streamId, userId }: { streamId: string; userId: string }) =>
      createStreamingService().leaveStream(streamId, userId),
    onSuccess: (_, { streamId, userId }) => {
      // Invalidate and refetch streaming session data
      queryClient.invalidateQueries({
        queryKey: streamQueryKeys.dashboard(streamId, userId),
      });
    },
  });
}
