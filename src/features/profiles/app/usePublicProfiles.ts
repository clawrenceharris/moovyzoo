import { useInfiniteQuery } from "@tanstack/react-query";
import { profilesService } from "../domain/profiles.service";
import { errorMap } from "../../auth/utils/error-map";
import type { PublicProfile } from "../domain/profiles.types";

/**
 * Hook for fetching public profiles with infinite scroll
 */
export function usePublicProfiles(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["public-profiles", limit],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await profilesService.getPublicProfiles(
        limit,
        pageParam * limit
      );
      if (!result.success) {
        const errorMessage = result.errorCode
          ? errorMap[result.errorCode]
          : errorMap.UNKNOWN_ERROR;
        throw new Error(errorMessage.message);
      }

      return {
        profiles: result.data!,
        nextPage: result.data!.length === limit ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000, // 2 minutes
    initialPageParam: 0,
  });
}

/**
 * Hook for searching public profiles (future enhancement)
 */
export function useSearchPublicProfiles(searchTerm: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["search-public-profiles", searchTerm, limit],
    queryFn: async ({ pageParam = 0 }) => {
      // TODO: Implement search functionality in service layer
      // For now, return empty results
      return {
        profiles: [] as PublicProfile[],
        nextPage: undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 30 * 1000, // 30 seconds for search results
    initialPageParam: 0,
  });
}
