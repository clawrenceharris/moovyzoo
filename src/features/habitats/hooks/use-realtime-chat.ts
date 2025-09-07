"use client";

import { useCallback, useMemo } from "react";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";
import type { MessageWithProfile } from "../domain/habitats.types";
import {
  useBaseRealtime,
  type UseBaseRealtimeOptions,
} from "@/hooks/base/use-base-realtime";

// Type for message payload from Supabase realtime
type MessagePayload = {
  id: string;
  habitat_id: string;
  chat_id?: string;
  user_id: string;
  content: string;
  created_at: string;
};

interface UseRealtimeChatCallbacks {
  onMessageInsert?: (message: MessageWithProfile) => void;
  onMessageUpdate?: (message: MessageWithProfile) => void;
  onMessageDelete?: (messageId: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

interface UseRealtimeChatOptions extends UseBaseRealtimeOptions {}

/**
 * Hook for managing real-time chat functionality with Supabase
 * Handles connection management, message subscriptions, and error recovery
 * Built on top of useBaseRealtime for shared functionality
 */
export function useRealtimeChat(
  habitatId: string | null,
  userId: string | null,
  callbacks: UseRealtimeChatCallbacks = {},
  options: UseRealtimeChatOptions = {}
) {
  // Process message payload and extract profile information
  const processMessagePayload = useCallback(
    async (
      payload: RealtimePostgresChangesPayload<MessagePayload>
    ): Promise<MessageWithProfile | null> => {
      try {
        const messageData =
          (payload.new as MessagePayload) || (payload.old as MessagePayload);
        if (!messageData) return null;

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
          chat_id: messageData.chat_id || "general", // Default to general discussion for backward compatibility
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
    []
  );

  // Create realtime callbacks that process message payloads
  const realtimeCallbacks = useMemo(
    () => ({
      onInsert: async (
        payload: RealtimePostgresChangesPayload<MessagePayload>
      ) => {
        const message = await processMessagePayload(payload);
        if (message && callbacks.onMessageInsert) {
          callbacks.onMessageInsert(message);
        }
      },
      onUpdate: async (
        payload: RealtimePostgresChangesPayload<MessagePayload>
      ) => {
        const message = await processMessagePayload(payload);
        if (message && callbacks.onMessageUpdate) {
          callbacks.onMessageUpdate(message);
        }
      },
      onDelete: (payload: RealtimePostgresChangesPayload<MessagePayload>) => {
        const messageId = (payload.old as MessagePayload)?.id as string;
        if (messageId && callbacks.onMessageDelete) {
          callbacks.onMessageDelete(messageId);
        }
      },
      onConnectionChange: callbacks.onConnectionChange,
      onError: callbacks.onError,
    }),
    [processMessagePayload, callbacks]
  );

  // Use the base realtime hook with habitat-specific configuration
  return useBaseRealtime({
    channelName: `habitat:${habitatId}`,
    tableName: "habitat_messages",
    filter: `habitat_id=eq.${habitatId}`,
    callbacks: realtimeCallbacks,
    enabled: !!(habitatId && userId),
    options: {
      autoReconnect: true,
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      ...options,
    },
  });
}

export type UseRealtimeChatReturn = ReturnType<typeof useRealtimeChat>;
