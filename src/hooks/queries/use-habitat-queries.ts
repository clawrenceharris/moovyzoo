/**
 * Habitat-specific React Query hooks
 * Provides data fetching for habitat-related operations with caching and error handling
 */

import { useBaseQuery, BaseQueryOptions } from "../base/use-base-query";
import { queryKeys } from "./query-keys";
import { habitatsService } from "@/features/habitats/domain/habitats.service";
import { habitatsRepository } from "@/features/habitats/data/habitats.repository";
import type {
  HabitatWithMembership,
  HabitatDashboardData,
  HabitatMember,
} from "@/features/habitats/domain/habitats.types";

/**
 * Hook to fetch all habitats that a user has joined
 */
export function useUserHabitats(
  userId: string,
  options: BaseQueryOptions<HabitatWithMembership[]> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.userHabitats(userId),
    async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return await habitatsService.getUserJoinedHabitats(userId);
    },
    {
      enabled: !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch a specific habitat by ID
 */
export function useHabitat(
  habitatId: string,
  userId?: string,
  options: BaseQueryOptions<HabitatWithMembership> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.detail(habitatId),
    async () => {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }
      return await habitatsService.getHabitatById(habitatId, userId);
    },
    {
      enabled: !!habitatId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch habitat dashboard data (habitat + discussions + polls + streaming sessions)
 */
export function useHabitatDashboard(
  habitatId: string,
  userId: string,
  options: BaseQueryOptions<HabitatDashboardData> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.dashboard(habitatId),
    async () => {
      if (!habitatId || !userId) {
        throw new Error("Habitat ID and User ID are required");
      }
      return await habitatsService.getDashboardData(habitatId, userId);
    },
    {
      enabled: !!habitatId && !!userId,
      staleTime: 1 * 60 * 1000, // 1 minute for dashboard data
      ...options,
    }
  );
}

/**
 * Hook to fetch habitat members
 */
export function useHabitatMembers(
  habitatId: string,
  options: BaseQueryOptions<HabitatMember[]> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.members(habitatId),
    async () => {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }
      return await habitatsService.getHabitatMembers(habitatId);
    },
    {
      enabled: !!habitatId,
      staleTime: 3 * 60 * 1000, // 3 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch habitat member count
 */
export function useHabitatMemberCount(
  habitatId: string,
  options: BaseQueryOptions<number> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.stats(habitatId),
    async () => {
      if (!habitatId) {
        throw new Error("Habitat ID is required");
      }
      return await habitatsService.getHabitatMemberCount(habitatId);
    },
    {
      enabled: !!habitatId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook to check if user is a member of a habitat
 * Uses repository directly since service doesn't expose this method
 */
export function useIsHabitatMember(
  habitatId: string,
  userId: string,
  options: BaseQueryOptions<boolean> = {}
) {
  return useBaseQuery(
    [...queryKeys.habitats.detail(habitatId), "membership", userId],
    async () => {
      if (!habitatId || !userId) {
        return false;
      }
      return await habitatsRepository.isUserMember(habitatId, userId);
    },
    {
      enabled: !!habitatId && !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    }
  );
}

/**
 * Hook to check if user can access a habitat
 */
export function useCanAccessHabitat(
  habitatId: string,
  userId: string,
  options: BaseQueryOptions<boolean> = {}
) {
  return useBaseQuery(
    [...queryKeys.habitats.detail(habitatId), "access", userId],
    async () => {
      if (!habitatId || !userId) {
        return false;
      }
      return await habitatsService.canUserAccessHabitat(habitatId, userId);
    },
    {
      enabled: !!habitatId && !!userId,
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch public habitats that the user hasn't joined yet
 */
export function usePublicHabitats(
  userId: string,
  limit: number = 12,
  options: BaseQueryOptions<HabitatWithMembership[]> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.publicHabitats(userId, limit),
    async () => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      return await habitatsService.getPublicHabitats(userId, limit);
    },
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    }
  );
}

/**
 * Hook to fetch popular public habitats
 */
export function usePopularHabitats(
  userId?: string,
  limit: number = 8,
  options: BaseQueryOptions<HabitatWithMembership[]> = {}
) {
  return useBaseQuery(
    queryKeys.habitats.popularHabitats(userId, limit),
    async () => {
      return await habitatsService.getPopularHabitats(userId, limit);
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes for popular habitats
      ...options,
    }
  );
}
