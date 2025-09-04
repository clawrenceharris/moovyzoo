/**
 * Discussion-specific React Query hooks
 * Provides data fetching for discussion-related operations with caching and error handling
 */

import { useBaseQuery, BaseQueryOptions } from "../base/use-base-query";
import { queryKeys } from "./query-keys";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import type {
  Discussion,
  DiscussionWithStats,
  MessageWithProfile,
} from "@/features/habitats/domain/habitats.types";

/**
 * Hook to fetch discussions for a specific habitat
 */
export function useDiscussions(
  habitatId: string,
  userId: string,
  options: BaseQueryOptions<DiscussionWithStats[]> = {}
) {
  return useBaseQuery(
    queryKeys.discussions.byHabitat(habitatId),
    async () => {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }
      return await habitatsService.getDiscussionsByHabitat(habitatId, userId);
    },
    {
      enabled: !!habitatId && !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch a specific discussion by ID
 */
export function useDiscussion(
  discussionId: string,
  userId: string,
  options: BaseQueryOptions<Discussion> = {}
) {
  return useBaseQuery(
    queryKeys.discussions.detail(discussionId),
    async () => {
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }
      return await habitatsService.getDiscussionById(discussionId, userId);
    },
    {
      enabled: !!discussionId && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch messages for a specific discussion
 */
export function useDiscussionMessages(
  discussionId: string,
  userId: string,
  limit = 50,
  offset = 0,
  options: BaseQueryOptions<MessageWithProfile[]> = {}
) {
  return useBaseQuery(
    queryKeys.discussions.messages(discussionId),
    async () => {
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }
      return await habitatsService.getMessagesByDiscussion(
        discussionId,
        userId,
        limit,
        offset
      );
    },
    {
      enabled: !!discussionId && !!userId,
      staleTime: 30 * 1000, // 30 seconds for messages
      refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time feel
      ...options,
    }
  );
}

/**
 * Hook to fetch messages after a specific timestamp for real-time updates
 */
export function useDiscussionMessagesAfter(
  discussionId: string,
  userId: string,
  timestamp: string,
  options: BaseQueryOptions<MessageWithProfile[]> = {}
) {
  return useBaseQuery(
    [...queryKeys.discussions.messages(discussionId), "after", timestamp],
    async () => {
      if (!discussionId || !userId || !timestamp) {
        throw new Error("Discussion ID, User ID, and timestamp are required");
      }
      return await habitatsService.getDiscussionMessagesAfter(
        discussionId,
        userId,
        timestamp
      );
    },
    {
      enabled: !!discussionId && !!userId && !!timestamp,
      staleTime: 0, // Always fresh for real-time updates
      refetchInterval: 5 * 1000, // Refetch every 5 seconds for real-time
      ...options,
    }
  );
}

/**
 * Hook for real-time discussion messages with optimistic updates
 * This hook automatically refetches messages and can be used for live chat
 */
export function useRealtimeDiscussionMessages(
  discussionId: string,
  userId: string,
  options: BaseQueryOptions<MessageWithProfile[]> = {}
) {
  return useBaseQuery(
    [...queryKeys.discussions.messages(discussionId), "realtime"],
    async () => {
      if (!discussionId || !userId) {
        throw new Error("Discussion ID and User ID are required");
      }
      return await habitatsService.getMessagesByDiscussion(
        discussionId,
        userId,
        50, // Default limit for real-time
        0 // Always start from beginning for real-time
      );
    },
    {
      enabled: !!discussionId && !!userId,
      staleTime: 0, // Always fresh
      refetchInterval: 3 * 1000, // Refetch every 3 seconds
      refetchIntervalInBackground: true, // Keep refetching even when tab is not active
      ...options,
    }
  );
}
