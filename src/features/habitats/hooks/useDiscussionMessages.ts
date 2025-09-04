"use client";

import { useMemo } from "react";
import { habitatsService } from "../domain/habitats.service";
import {
  useBaseMessages,
  type UseBaseMessagesOptions,
} from "@/hooks/base/use-base-messages";

interface UseDiscussionMessagesOptions extends UseBaseMessagesOptions {}

/**
 * Hook for managing discussion-specific chat messages
 * Provides message loading, sending, pagination, and error handling for individual discussions
 * Built on top of useBaseMessages for shared functionality
 */
export function useDiscussionMessages(
  habitatId: string | null,
  discussionId: string | null,
  userId: string | null,
  options: UseDiscussionMessagesOptions = {}
) {
  // Create message service adapter for discussion messages
  const messageService = useMemo(
    () => ({
      fetchMessages: async (
        resourceId: string,
        userId: string,
        limit: number,
        offset: number
      ) => {
        return habitatsService.getMessagesByDiscussion(
          resourceId,
          userId,
          limit,
          offset
        );
      },
      sendMessage: async (
        resourceId: string,
        userId: string,
        content: string
      ) => {
        // For discussions, we need both habitatId and discussionId
        if (!habitatId) {
          throw new Error("Habitat ID is required for discussion messages");
        }
        return habitatsService.sendMessageToDiscussion(
          habitatId,
          resourceId,
          userId,
          content
        );
      },
      deleteMessage: async (
        messageId: string,
        userId: string,
        resourceId: string
      ) => {
        // For discussions, we need the habitatId for deletion
        if (!habitatId) {
          throw new Error("Habitat ID is required for message deletion");
        }
        return habitatsService.deleteMessage(messageId, userId, habitatId);
      },
    }),
    [habitatId]
  );

  // Use the base messages hook with discussion-specific service
  return useBaseMessages({
    resourceId: discussionId,
    userId,
    messageService,
    options,
  });
}

export type UseDiscussionMessagesReturn = ReturnType<
  typeof useDiscussionMessages
>;
