import { useQuery } from "@tanstack/react-query";
import { streamService, StreamService } from "../domain/stream.service";
import type {
  StreamWithParticipants,
  StreamParticipant,
} from "../domain/stream.types";

// Create service instance - can be mocked in tests
const createStreamingService = () => new StreamService();

/**
 * Query keys for streaming session queries
 */
export const streamQueryKeys = {
  all: ["streams"] as const,
  stream: (id: string) => ["stream", id] as const,
  participants: (streamId: string) => ["streamParticipants", streamId] as const,
  dashboard: (id: string, userId: string) =>
    ["streams", "dashboard", id, userId] as const,
  publicStreams: (options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: "upcoming" | "live" | "ended";
  }) => ["streams", "public", options] as const,
  userStreams: (
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      search?: string;
      status?: "upcoming" | "live" | "ended";
    }
  ) => ["streams", "user", userId, options] as const,
};

/**
 * Hook to get streaming session data with media and participation information
 */
export function useStream(id: string) {
  return useQuery({
    queryKey: streamQueryKeys.stream(id),
    queryFn: () => streamService.getStream(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

/**
 * Hook to get participants for a streaming session
 */
export function useStreamParticipants(streamId: string) {
  return useQuery({
    queryKey: streamQueryKeys.participants(streamId),
    queryFn: () => streamService.getParticipants(streamId),
    enabled: !!streamId,
    staleTime: 10 * 1000, // 10 seconds for more frequent updates
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for participant changes
  });
}

/**
 * Hook to get public streams with pagination and filtering
 */
export function usePublicStreams(
  userId: string | null,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: "upcoming" | "live" | "ended";
  } = {}
) {
  return useQuery({
    queryKey: streamQueryKeys.publicStreams(options),
    queryFn: () => (userId ? streamService.getPublicStreams(options) : null),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}

/**
 * Hook to get streams for a specific user (public + their private streams)
 */
export function useUserStreams(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: "upcoming" | "live" | "ended";
  } = {}
) {
  return useQuery({
    queryKey: streamQueryKeys.userStreams(userId, options),
    queryFn: () => streamService.getUserStreams(userId, options),
    enabled: !!userId && typeof userId === "string" && userId.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
}
