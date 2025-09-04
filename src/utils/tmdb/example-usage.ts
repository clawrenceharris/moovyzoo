/**
 * Example usage of TMDB service for media integration
 * This file demonstrates how to use the TMDB service in components
 */

import { tmdbService, SelectedMedia } from "./service";

// Example: Search for media and handle results
export async function exampleMediaSearch(
  query: string
): Promise<SelectedMedia[]> {
  try {
    const results = await tmdbService.searchMedia(query);

    // Transform results to SelectedMedia format
    return results.map((result) =>
      tmdbService.transformToSelectedMedia(result)
    );
  } catch (error) {
    console.error("Media search failed:", error);
    throw error;
  }
}

// Example: Get poster URL for display
export function exampleGetPosterUrl(posterPath?: string): string {
  if (!posterPath) {
    return "/placeholder-poster.jpg"; // Fallback image
  }

  return tmdbService.getPosterUrl(posterPath, "w500");
}

// Example: Handle different poster sizes for responsive design
export function exampleGetResponsivePosterUrls(posterPath?: string) {
  if (!posterPath) {
    return {
      small: "/placeholder-poster.jpg",
      medium: "/placeholder-poster.jpg",
      large: "/placeholder-poster.jpg",
    };
  }

  return {
    small: tmdbService.getPosterUrl(posterPath, "w185"),
    medium: tmdbService.getPosterUrl(posterPath, "w342"),
    large: tmdbService.getPosterUrl(posterPath, "w500"),
  };
}

// Example: Cache management for performance
export function exampleCacheManagement() {
  // Get cache statistics
  const stats = tmdbService.getCacheStats();
  console.log(`Cache contains ${stats.size} entries:`, stats.entries);

  // Clear cache if needed (e.g., on logout or memory pressure)
  if (stats.size > 100) {
    tmdbService.clearCache();
    console.log("Cache cleared due to size limit");
  }
}

// Example: Error handling patterns
export async function exampleErrorHandling(query: string) {
  try {
    return await tmdbService.searchMedia(query);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "TMDB_RATE_LIMIT_EXCEEDED":
          // Show user-friendly message and suggest retry
          throw new Error(
            "Too many searches. Please wait a moment and try again."
          );

        case "TMDB_NETWORK_ERROR":
          // Suggest checking connection
          throw new Error("Network error. Please check your connection.");

        case "TMDB_UNAUTHORIZED":
          // This shouldn't happen in production, log for debugging
          console.error("TMDB API key issue");
          throw new Error("Service temporarily unavailable.");

        default:
          throw new Error("Search failed. Please try again.");
      }
    }
    throw error;
  }
}
