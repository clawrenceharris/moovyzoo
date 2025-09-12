"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import type { MessageWithProfile } from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";

// Type for message payload from Supabase realtime
type MessagePayload = {
  id: string;
  habitat_id: string;
  chat_id?: string;
  user_id: string;
  content: string;
  created_at: string;
};

interface UseDiscussionRealtimeChatState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

interface UseDiscussionRealtimeChatCallbacks {
  onMessageInsert?: (message: MessageWithProfile) => void;
  onMessageUpdate?: (message: MessageWithProfile) => void;
  onMessageDelete?: (messageId: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

interface UseDiscussionRealtimeChatOptions {
  autoReconnect?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

/**
 * Hook for managing real-time chat functionality for specific discussions
 * Handles connection management, message subscriptions, and error recovery for discussion rooms
 */
export function useDiscussionRealtimeChat(
  habitatId: string | null,
  discussionId: string | null,
  userId: string | null,
  callbacks: UseDiscussionRealtimeChatCallbacks = {},
  options: UseDiscussionRealtimeChatOptions = {}
) {
  const {
    autoReconnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [state, setState] = useState<UseDiscussionRealtimeChatState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  // Store latest callbacks in refs to avoid dependency issues
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  // Clear any existing reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Process message payload and extract profile information
  const processMessagePayload = useCallback(
    async (
      payload: RealtimePostgresChangesPayload<MessagePayload>
    ): Promise<MessageWithProfile | null> => {
      try {
        const messageData =
          (payload.new as MessagePayload) || (payload.old as MessagePayload);
        if (!messageData) return null;

        // Only process messages for this specific discussion
        if (messageData.chat_id !== discussionId) {
          return null;
        }

        // Fetch user profile for the message
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("display_name, avatar_url")
          .eq("id", messageData.user_id)
          .single();

        if (profileError) {
          console.warn("Failed to fetch profile for message:", profileError);
        }

        return {
          id: messageData.id,
          habitat_id: messageData.habitat_id,
          chat_id: messageData.chat_id || discussionId!,
          user_id: messageData.user_id,
          content: messageData.content,
          created_at: messageData.created_at,
          user_profile: {
            display_name: profile?.display_name || "Unknown User",
            avatar_url: profile?.avatar_url || undefined,
          },
        };
      } catch (error) {
        console.error("Error processing message payload:", error);
        return null;
      }
    },
    [discussionId]
  );

  // Connect to real-time channel for specific discussion
  const connect = useCallback(async () => {
    if (!habitatId || !discussionId || !userId || isUnmountedRef.current) {
      return;
    }

    // Don't connect if already connected
    if (channelRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Create channel for this specific discussion
      const channelName = `discussion:${discussionId}`;
      const channel = supabase.channel(channelName);

      // Subscribe to message changes for this specific discussion
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "habitat_messages",
            filter: `chat_id=eq.${discussionId}`,
          },
          async (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
            const message = await processMessagePayload(payload);
            if (message && callbacksRef.current.onMessageInsert) {
              callbacksRef.current.onMessageInsert(message);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "habitat_messages",
            filter: `chat_id=eq.${discussionId}`,
          },
          async (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
            const message = await processMessagePayload(payload);
            if (message && callbacksRef.current.onMessageUpdate) {
              callbacksRef.current.onMessageUpdate(message);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "habitat_messages",
            filter: `chat_id=eq.${discussionId}`,
          },
          (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
            const messageId = (payload.old as MessagePayload)?.id as string;
            if (messageId && callbacksRef.current.onMessageDelete) {
              callbacksRef.current.onMessageDelete(messageId);
            }
          }
        );

      // Handle channel status changes
      channel.subscribe((status, err) => {
        if (isUnmountedRef.current) return;

        switch (status) {
          case "SUBSCRIBED":
            channelRef.current = channel;
            reconnectAttemptsRef.current = 0;
            setState((prev) => ({
              ...prev,
              connected: true,
              connecting: false,
            }));
            callbacksRef.current.onConnectionChange?.(true);
            break;
          case "CHANNEL_ERROR":
          case "TIMED_OUT":
          case "CLOSED":
            channelRef.current = null;
            setState((prev) => ({
              ...prev,
              connected: false,
              connecting: false,
            }));
            callbacksRef.current.onConnectionChange?.(false);

            if (err) {
              const normalizedError = normalizeError(err);
              setState((prev) => ({ ...prev, error: normalizedError.message }));
              callbacksRef.current.onError?.(normalizedError.message);
            }

            // Attempt reconnection if enabled
            if (
              autoReconnect &&
              reconnectAttemptsRef.current < maxReconnectAttempts
            ) {
              clearReconnectTimeout();
              reconnectTimeoutRef.current = setTimeout(() => {
                if (!isUnmountedRef.current) {
                  reconnectAttemptsRef.current += 1;
                  connect();
                }
              }, reconnectDelay);
            }
            break;
        }
      });
    } catch (error) {
      if (!isUnmountedRef.current) {
        const normalizedError = normalizeError(error);
        setState((prev) => ({
          ...prev,
          error: normalizedError.message,
          connecting: false,
        }));
        callbacksRef.current.onError?.(normalizedError.message);
      }
    }
  }, [
    habitatId,
    discussionId,
    userId,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    processMessagePayload,
    clearReconnectTimeout,
  ]);

  // Disconnect from real-time channel
  const disconnect = useCallback(() => {
    clearReconnectTimeout();

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setState((prev) => ({ ...prev, connected: false, connecting: false }));
    callbacksRef.current.onConnectionChange?.(false);
    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout]);

  // Manually reconnect
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Connect on mount and when habitatId/discussionId/userId changes
  useEffect(() => {
    if (habitatId && discussionId && userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [habitatId, discussionId, userId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      disconnect();
    };
  }, [disconnect]);

  return {
    // State
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,

    // Actions
    connect,
    disconnect,
    reconnect,
    clearError,

    // Status
    canReconnect: reconnectAttemptsRef.current < maxReconnectAttempts,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}

export type UseDiscussionRealtimeChatReturn = ReturnType<
  typeof useDiscussionRealtimeChat
>;
