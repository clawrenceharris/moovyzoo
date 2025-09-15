"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { streamChatService } from "../domain/chat.service";
import type {
  StreamMessage,
  StreamMessageInsert,
} from "../domain/stream.types";

/**
 * Query keys for stream chat
 */
export const streamChatQueryKeys = {
  messages: (streamId: string) => ["stream-messages", streamId] as const,
};

/**
 * Hook to get stream messages with real-time updates
 */
export function useStreamMessages(streamId: string, userId: string) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: streamChatQueryKeys.messages(streamId),
    queryFn: () => streamChatService.getMessages(streamId, userId),
    enabled: !!streamId && !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!streamId) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // Subscribe to new messages
    subscriptionRef.current = supabase
      .channel(`stream-messages:${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stream_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Add the new message to the cache
          queryClient.setQueryData<StreamMessage[]>(
            streamChatQueryKeys.messages(streamId),
            (oldMessages = []) => {
              // Check if message already exists to prevent duplicates
              const messageExists = oldMessages.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) return oldMessages;

              return [
                ...oldMessages,
                {
                  id: newMessage.id,
                  stream_id: newMessage.stream_id,
                  user_id: newMessage.user_id,
                  message: newMessage.message,
                  created_at: newMessage.created_at,
                  profile: undefined, // Will be populated by refetch
                },
              ];
            }
          );

          // Refetch to get profile information
          queryClient.invalidateQueries({
            queryKey: streamChatQueryKeys.messages(streamId),
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "stream_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const deletedMessage = payload.old as any;

          // Remove the message from the cache
          queryClient.setQueryData<StreamMessage[]>(
            streamChatQueryKeys.messages(streamId),
            (oldMessages = []) => {
              return oldMessages.filter((msg) => msg.id !== deletedMessage.id);
            }
          );
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [streamId, queryClient]);

  return query;
}

/**
 * Hook to send a message to a stream
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: StreamMessageInsert) =>
      streamChatService.sendMessage(messageData),
    onSuccess: (newMessage) => {
      // The real-time subscription will handle adding the message to the cache
      // But we can also optimistically update here for immediate feedback
      queryClient.setQueryData<StreamMessage[]>(
        streamChatQueryKeys.messages(newMessage.stream_id),
        (oldMessages = []) => {
          // Check if message already exists to prevent duplicates
          const messageExists = oldMessages.some(
            (msg) => msg.id === newMessage.id
          );
          if (messageExists) return oldMessages;

          return [...oldMessages, newMessage];
        }
      );
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
    },
  });
}

/**
 * Hook to delete a message
 */
export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      userId,
    }: {
      messageId: string;
      userId: string;
    }) => streamChatService.deleteMessage(messageId, userId),
    onSuccess: (_, { messageId }) => {
      // The real-time subscription will handle removing the message from the cache
      // But we can also optimistically update here for immediate feedback
      queryClient.setQueryData<StreamMessage[]>(
        streamChatQueryKeys.messages(""), // We don't have streamId here, subscription will handle it
        (oldMessages = []) => {
          return oldMessages.filter((msg) => msg.id !== messageId);
        }
      );
    },
    onError: (error) => {
      console.error("Failed to delete message:", error);
    },
  });
}
