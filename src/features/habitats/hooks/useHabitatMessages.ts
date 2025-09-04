"use client";

import { useMemo } from "react";
import { habitatsService } from "../domain/habitats.service";
import {
  useBaseMessages,
  type UseBaseMessagesOptions,
} from "@/hooks/base/use-base-messages";

interface UseHabitatMessagesOptions extends UseBaseMessagesOptions {}

/**
 * Hook for managing habitat chat messages
 * Provides message loading, sending, pagination, and error handling
 * Built on top of useBaseMessages for shared functionality
 */
export function useHabitatMessages(
  habitatId: string | null,
  userId: string | null,
  options: UseHabitatMessagesOptions = {}
) {
  // Create message service adapter for habitat messages
  const messageService = useMemo(
    () => ({
      fetchMessages: async (
        resourceId: string,
        userId: string,
        limit: number,
        offset: number
      ) => {
        return habitatsService.getHabitatMessages(
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
        return habitatsService.sendMessage(resourceId, userId, content);
      },
      deleteMessage: async (
        messageId: string,
        userId: string,
        resourceId: string
      ) => {
        return habitatsService.deleteMessage(messageId, userId, resourceId);
      },
    }),
    []
  );

  // Use the base messages hook with habitat-specific service
  return useBaseMessages({
    resourceId: habitatId,
    userId,
    messageService,
    options,
  });
}

export type UseHabitatMessagesReturn = ReturnType<typeof useHabitatMessages>;
