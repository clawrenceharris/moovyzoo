"use client";

import { useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useBaseRealtime } from "@/hooks/base/use-base-realtime";
import { streamQueryKeys } from "./use-stream-queries";

interface StreamParticipantPayload {
  stream_id: string;
  user_id: string;
  is_active: boolean;
  joined_at?: string;
}

interface UseStreamRealtimeOptions {
  enabled?: boolean;
  autoReconnect?: boolean;
  onParticipantJoin?: (userId: string) => void;
  onParticipantLeave?: (userId: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for real-time streaming session participant updates
 * Handles participant join/leave events and connection management
 */
export function useStreamRealtime(
  streamId: string,
  userId: string,
  options: UseStreamRealtimeOptions = {}
) {
  const {
    enabled = true,
    autoReconnect = true,
    onParticipantJoin: externalOnParticipantJoin,
    onParticipantLeave: externalOnParticipantLeave,
    onConnectionChange: externalOnConnectionChange,
    onError: externalOnError,
  } = options;

  const queryClient = useQueryClient();

  // Local state for participant tracking
  const [participantCount, setParticipantCount] = useState(0);
  const [recentJoins, setRecentJoins] = useState<string[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<string[]>([]);

  // Refs to track recent activity (for cleanup)
  const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear recent activity after delay
  const clearRecentActivity = useCallback(() => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }

    joinTimeoutRef.current = setTimeout(() => {
      setRecentJoins([]);
    }, 5000); // Clear after 5 seconds

    leaveTimeoutRef.current = setTimeout(() => {
      setRecentLeaves([]);
    }, 5000); // Clear after 5 seconds
  }, []);

  // Handle participant join events
  const handleParticipantJoin = useCallback(
    (payload: RealtimePostgresChangesPayload<StreamParticipantPayload>) => {
      const participant = payload.new;

      if (
        !participant ||
        typeof participant !== "object" ||
        participant === null ||
        !("stream_id" in participant) ||
        (participant as StreamParticipantPayload).stream_id !== streamId
      ) {
        return;
      }

      // Only track active participants
      if (participant.is_active) {
        setParticipantCount((prev) => prev + 1);
        setRecentJoins((prev) => [...prev, participant.user_id]);
        clearRecentActivity();

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: streamQueryKeys.dashboard(streamId, userId),
        });
        queryClient.invalidateQueries({
          queryKey: streamQueryKeys.participants(streamId),
        });

        // Call external callback
        externalOnParticipantJoin?.(participant.user_id);
      }
    },
    [
      streamId,
      userId,
      queryClient,
      externalOnParticipantJoin,
      clearRecentActivity,
    ]
  );

  // Handle participant leave events
  const handleParticipantLeave = useCallback(
    (payload: RealtimePostgresChangesPayload<StreamParticipantPayload>) => {
      const participant = (payload.new ||
        payload.old) as StreamParticipantPayload;

      if (
        !participant ||
        typeof participant !== "object" ||
        participant === null ||
        !("stream_id" in participant) ||
        participant.stream_id !== streamId
      ) {
        return;
      }

      // Track when participants become inactive
      if (!participant.is_active) {
        setParticipantCount((prev) => Math.max(0, prev - 1));
        setRecentLeaves((prev) => [...prev, participant.user_id]);
        clearRecentActivity();

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: streamQueryKeys.dashboard(streamId, userId),
        });
        queryClient.invalidateQueries({
          queryKey: streamQueryKeys.participants(streamId),
        });

        // Call external callback
        externalOnParticipantLeave?.(participant.user_id);
      }
    },
    [
      streamId,
      userId,
      queryClient,
      externalOnParticipantLeave,
      clearRecentActivity,
    ]
  );

  // Handle connection status changes
  const handleConnectionChange = useCallback(
    (connected: boolean) => {
      if (connected) {
        // Reset participant tracking on reconnection
        setParticipantCount(0);
        setRecentJoins([]);
        setRecentLeaves([]);
      }

      externalOnConnectionChange?.(connected);
    },
    [externalOnConnectionChange]
  );

  // Handle errors
  const handleError = useCallback(
    (error: string) => {
      externalOnError?.(error);
    },
    [externalOnError]
  );

  // Set up real-time subscription
  const realtimeState = useBaseRealtime<StreamParticipantPayload>({
    channelName: `stream-participants-${streamId}`,
    tableName: "streaming_members",
    filter: `stream_id=eq.${streamId}`,
    enabled: enabled && !!streamId && !!userId,
    callbacks: {
      onInsert: handleParticipantJoin,
      onUpdate: handleParticipantLeave,
      onDelete: handleParticipantLeave,
      onConnectionChange: handleConnectionChange,
      onError: handleError,
    },
    options: {
      autoReconnect,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
    },
  });

  return {
    // Connection state from base realtime hook
    connected: realtimeState.connected,
    connecting: realtimeState.connecting,
    error: realtimeState.error,

    // Participant tracking
    participantCount,
    recentJoins,
    recentLeaves,

    // Actions from base realtime hook
    reconnect: realtimeState.reconnect,
    clearError: realtimeState.clearError,

    // Event handlers (exposed for testing)
    onParticipantJoin: handleParticipantJoin,
    onParticipantLeave: handleParticipantLeave,
    onConnectionChange: handleConnectionChange,
    onError: handleError,
  };
}

export type UseStreamRealtimeReturn = ReturnType<typeof useStreamRealtime>;
