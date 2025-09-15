/**
 * Habitat-specific React Query mutation hooks
 * Provides mutations for habitat-related operations with error handling and cache invalidation
 */

import { streamService } from "@/features/streaming/domain/stream.service";
import {
  useBaseMutation,
  useBaseCreateMutation,
  useBaseDeleteMutation,
  BaseMutationOptions,
} from "../base/use-base-mutation";
import { queryKeys } from "../queries/query-keys";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import type {
  Habitat,
  HabitatMember,
  MessageWithProfile,
} from "@/features/habitats/domain/habitats.types";

/**
 * Mutation hook for creating a new habitat
 */
export function useCreateHabitat(
  options: BaseMutationOptions<
    Habitat,
    Error,
    {
      name: string;
      description: string;
      tags: string[];
      isPublic: boolean;
      userId: string;
      bannerUrl?: string;
    },
    unknown
  > = {}
) {
  return useBaseCreateMutation(
    async ({ name, description, tags, isPublic, userId, bannerUrl }) => {
      return await habitatsService.createHabitat(
        name,
        description,
        tags,
        isPublic,
        userId,
        bannerUrl
      );
    },
    {
      invalidateQueries: [queryKeys.habitats.all],
      successMessage: "Habitat created successfully!",
      ...options,
    }
  );
}

/**
 * Mutation hook for joining a habitat
 */
export function useJoinHabitat(
  options: BaseMutationOptions<
    HabitatMember,
    Error,
    { habitatId: string; userId: string },
    unknown
  > = {}
) {
  return useBaseMutation(
    async ({ habitatId, userId }) => {
      return await habitatsService.joinHabitat(habitatId, userId);
    },
    {
      successMessage: "Successfully joined habitat!",
      invalidateQueries: [queryKeys.habitats.all],
      ...options,
    }
  );
}

/**
 * Mutation hook for leaving a habitat
 */
export function useLeaveHabitat(
  options: BaseMutationOptions<
    void,
    Error,
    { habitatId: string; userId: string },
    unknown
  > = {}
) {
  return useBaseMutation(
    async ({ habitatId, userId }) => {
      return await habitatsService.leaveHabitat(habitatId, userId);
    },
    {
      successMessage: "Successfully left habitat",
      invalidateQueries: [queryKeys.habitats.all],
      ...options,
    }
  );
}

/**
 * Mutation hook for sending a message to a habitat
 */
export function useSendMessage(
  habitatId: string,
  options: BaseMutationOptions<
    MessageWithProfile,
    Error,
    { userId: string; content: string },
    unknown
  > = {}
) {
  return useBaseMutation(
    async ({ userId, content }) => {
      return await habitatsService.sendMessage(habitatId, userId, content);
    },
    {
      invalidateQueries: [
        queryKeys.messages.byHabitat(habitatId),
        queryKeys.messages.recent(habitatId),
        queryKeys.habitats.dashboard(habitatId),
      ],
      ...options,
    }
  );
}

/**
 * Mutation hook for deleting a message
 */
export function useDeleteMessage(
  habitatId: string,
  options: BaseMutationOptions<
    void,
    Error,
    { messageId: string; userId: string },
    unknown
  > = {}
) {
  return useBaseDeleteMutation(
    async ({ messageId, userId }) => {
      return await habitatsService.deleteMessage(messageId, userId, habitatId);
    },
    {
      successMessage: "Message deleted successfully",
      invalidateQueries: [
        queryKeys.messages.byHabitat(habitatId),
        queryKeys.messages.recent(habitatId),
        queryKeys.habitats.dashboard(habitatId),
      ],
      ...options,
    }
  );
}
