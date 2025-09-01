import { useInfiniteQuery } from "@tanstack/react-query";
import type { PublicProfile } from "../domain/profiles.types";

/**
 * Hook for fetching public profiles with infinite scroll
 */
export function usePublicProfiles() {}

/**
 * Hook for searching public profiles (future enhancement)
 */
export function useSearchPublicProfiles(searchTerm: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["search-public-profiles", searchTerm, limit],
    queryFn: async () => {
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
