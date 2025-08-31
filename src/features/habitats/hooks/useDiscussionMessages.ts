"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { habitatsService } from "../domain/habitats.service";
import type { MessageWithProfile } from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";

interface UseDiscussionMessagesState {
  messages: MessageWithProfile[];
  loading: boolean;
  loadingMore: boolean;
  sending: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseDiscussionMessagesOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Hook for managing discussion-specific chat messages
 * Provides message loading, sending, pagination, and error handling for individual discussions
 */
export function useDiscussionMessages(
  habitatId: string | null,
  discussionId: string | null,
  userId: string | null,
  options: UseDiscussionMessagesOptions = {}
) {
  const {
    limit = 50,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [state, setState] = useState<UseDiscussionMessagesState>({
    messages: [],
    loading: false,
    loadingMore: false,
    sending: false,
    error: null,
    hasMore: true,
  });

  const offsetRef = useRef(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages with pagination for specific discussion
  const fetchMessages = useCallback(
    async (reset = false) => {
      if (!habitatId || !discussionId || !userId) {
        setState({
          messages: [],
          loading: false,
          loadingMore: false,
          sending: false,
          error: null,
          hasMore: false,
        });
        return;
      }

      const currentOffset = reset ? 0 : offsetRef.current;

      setState((prev) => {
        const isInitialLoad = reset || prev.messages.length === 0;
        return {
          ...prev,
          loading: isInitialLoad,
          loadingMore: !isInitialLoad,
          error: null,
        };
      });

      try {
        const newMessages = await habitatsService.getMessagesByDiscussion(
          discussionId,
          userId,
          limit,
          currentOffset
        );

        setState((prev) => {
          const updatedMessages = reset
            ? newMessages
            : [...prev.messages, ...newMessages];

          return {
            ...prev,
            messages: updatedMessages,
            loading: false,
            loadingMore: false,
            hasMore: newMessages.length === limit,
          };
        });

        offsetRef.current = reset
          ? newMessages.length
          : offsetRef.current + newMessages.length;
      } catch (error) {
        const normalizedError = normalizeError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: normalizedError.message,
        }));
      }
    },
    [habitatId, discussionId, userId, limit]
  );

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    setState((prev) => {
      if (prev.loadingMore || !prev.hasMore) return prev;
      return prev; // State will be updated in fetchMessages
    });
    await fetchMessages(false);
  }, [fetchMessages]);

  // Send a new message to the discussion
  const sendMessage = useCallback(
    async (content: string) => {
      if (!habitatId || !discussionId || !userId) {
        throw new Error("Habitat ID, Discussion ID, and User ID are required");
      }

      if (!content.trim()) {
        throw new Error("Message content cannot be empty");
      }

      setState((prev) => ({ ...prev, sending: true, error: null }));

      try {
        const newMessage = await habitatsService.sendMessageToDiscussion(
          habitatId,
          discussionId,
          userId,
          content
        );

        // Add the new message to the beginning of the list (most recent first)
        setState((prev) => ({
          ...prev,
          messages: [newMessage, ...prev.messages],
          sending: false,
        }));

        offsetRef.current += 1;
      } catch (error) {
        const normalizedError = normalizeError(error);

        setState((prev) => ({
          ...prev,
          sending: false,
          error: normalizedError.message,
        }));
        console.log(error);
        throw new Error(normalizedError.message);
      }
    },
    [habitatId, discussionId, userId]
  );

  // Delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!habitatId || !discussionId || !userId) {
        throw new Error("Habitat ID, Discussion ID, and User ID are required");
      }

      try {
        await habitatsService.deleteMessage(messageId, userId, habitatId);

        // Remove the message from the list
        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((msg) => msg.id !== messageId),
        }));

        offsetRef.current = Math.max(0, offsetRef.current - 1);
      } catch (error) {
        const normalizedError = normalizeError(error);
        console.log(error);

        throw new Error(normalizedError.message);
      }
    },
    [habitatId, discussionId, userId]
  );

  // Add a new message from real-time updates
  const addMessage = useCallback((message: MessageWithProfile) => {
    setState((prev) => {
      // Check if message already exists to avoid duplicates
      const exists = prev.messages.some((msg) => msg.id === message.id);
      if (exists) return prev;

      return {
        ...prev,
        messages: [message, ...prev.messages],
      };
    });
    offsetRef.current += 1;
  }, []);

  // Update an existing message (for real-time updates)
  const updateMessage = useCallback((updatedMessage: MessageWithProfile) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === updatedMessage.id ? updatedMessage : msg
      ),
    }));
  }, []);

  // Remove a message (for real-time updates)
  const removeMessage = useCallback((messageId: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((msg) => msg.id !== messageId),
    }));
    offsetRef.current = Math.max(0, offsetRef.current - 1);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Refresh messages (reset and fetch from beginning)
  const refresh = useCallback(() => {
    offsetRef.current = 0;
    fetchMessages(true);
  }, [fetchMessages]);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    fetchMessages(true);

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        // Reset offset and fetch fresh messages
        offsetRef.current = 0;
        fetchMessages(true);
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [
    habitatId,
    discussionId,
    userId,
    fetchMessages,
    autoRefresh,
    refreshInterval,
  ]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    messages: state.messages,
    loading: state.loading,
    loadingMore: state.loadingMore,
    sending: state.sending,
    error: state.error,
    hasMore: state.hasMore,

    // Actions
    sendMessage,
    deleteMessage,
    loadMore,
    refresh,
    clearError,

    // Real-time helpers (for use with useDiscussionRealtimeChat)
    addMessage,
    updateMessage,
    removeMessage,
  };
}

export type UseDiscussionMessagesReturn = ReturnType<
  typeof useDiscussionMessages
>;
