/**
 * Discussion-specific React Query mutation hooks
 * Provides mutations for discussion-related operations with error handling and cache invalidation
 */

import {
  useBaseMutation,
  useBaseCreateMutation,
  BaseMutationOptions,
} from "../base/use-base-mutation";
import { queryKeys } from "../queries/query-keys";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import type {
  Discussion,
  MessageWithProfile,
  Poll,
} from "@/features/habitats/domain/habitats.types";

/**
 * Mutation hook for creating a new discussion
 */
export function useCreateDiscussion(
  habitatId: string,
  options: BaseMutationOptions<
    Discussion,
    Error,
    {
      name: string;
      description?: string;
      userId: string;
    },
    unknown
  > = {}
) {
  return useBaseCreateMutation(
    async ({ name, description, userId }) => {
      return await habitatsService.createDiscussion(
        habitatId,
        name,
        description,
        userId
      );
    },
    {
      successMessage: "Discussion created successfully!",
      invalidateQueries: [
        queryKeys.discussions.byHabitat(habitatId),
        queryKeys.habitats.dashboard(habitatId),
      ],
      ...options,
    }
  );
}

/**
 * Mutation hook for sending a message to a discussion
 */
export function useSendDiscussionMessage(
  habitatId: string,
  discussionId: string,
  options: BaseMutationOptions<
    MessageWithProfile,
    Error,
    {
      userId: string;
      content: string;
    },
    unknown
  > = {}
) {
  return useBaseMutation(
    async ({ userId, content }) => {
      return await habitatsService.sendMessageToDiscussion(
        habitatId,
        discussionId,
        userId,
        content
      );
    },
    {
      invalidateQueries: [
        queryKeys.discussions.messages(discussionId),
        queryKeys.discussions.byHabitat(habitatId),
        queryKeys.messages.byDiscussion(discussionId),
        queryKeys.habitats.dashboard(habitatId),
      ],
      ...options,
    }
  );
}

/**
 * Mutation hook for creating a poll in a habitat
 */
export function useCreatePoll(
  habitatId: string,
  options: BaseMutationOptions<
    Poll,
    Error,
    {
      title: string;
      options: Record<string, number>;
      userId: string;
    },
    unknown
  > = {}
) {
  return useBaseCreateMutation(
    async ({ title, options: pollOptions, userId }) => {
      return await habitatsService.createPoll(
        habitatId,
        title,
        pollOptions,
        userId
      );
    },
    {
      successMessage: "Poll created successfully!",
      invalidateQueries: [
        queryKeys.polls.byHabitat(habitatId),
        queryKeys.habitats.dashboard(habitatId),
      ],
      ...options,
    }
  );
}
