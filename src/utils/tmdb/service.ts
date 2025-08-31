import { moviedb } from "../tmbd/client";

// TMDB API interfaces
export interface TMDBSearchResult {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  poster_path?: string;
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
  media_type: "movie" | "tv";
  overview?: string;
  runtime?: number; // For movies
  episode_run_time?: number[]; // For TV shows
}

export interface SelectedMedia {
  tmdb_id: number;
  media_type: "movie" | "tv";
  media_title: string;
  poster_path?: string;
  release_date?: string;
  runtime?: number;
}

export interface TMDBMultiSearchResponse {
  results: TMDBSearchResult[];
  total_results: number;
  total_pages: number;
}

// Cache interface for search results
interface CacheEntry {
  data: TMDBSearchResult[];
  timestamp: number;
}

class TMDBService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RESULTS = 10;
  private readonly IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
  private readonly DEFAULT_POSTER_SIZE = "w500";

  /**
   * Search for movies and TV shows using TMDB multi-search
   */
  async searchMedia(query: string): Promise<TMDBSearchResult[]> {
    if (!query || query.length < 3) {
      return [];
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await moviedb.searchMulti({
        query: query.trim(),
        page: 1,
        include_adult: false,
      });

      if (!response.results) {
        return [];
      }

      // Filter and transform results
      const results = response.results
        .filter(
          (item: any) =>
            (item.media_type === "movie" || item.media_type === "tv") &&
            (item.title || item.name) // Must have a title
        )
        .slice(0, this.MAX_RESULTS)
        .map(
          (item: any): TMDBSearchResult => ({
            id: item.id,
            title: item.title,
            name: item.name,
            poster_path: item.poster_path,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            media_type: item.media_type as "movie" | "tv",
            overview: item.overview,
            runtime: item.runtime,
            episode_run_time: item.episode_run_time,
          })
        );

      // Cache the results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      // Clean up old cache entries
      this.cleanupCache();

      return results;
    } catch (error) {
      console.error("TMDB search error:", error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("429")) {
          throw new Error("TMDB_RATE_LIMIT_EXCEEDED");
        }
        if (error.message.includes("401")) {
          throw new Error("TMDB_UNAUTHORIZED");
        }
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          throw new Error("TMDB_NETWORK_ERROR");
        }
      }

      throw new Error("TMDB_SEARCH_FAILED");
    }
  }

  /**
   * Construct TMDB image URL with proper sizing
   */
  getImageUrl(path: string, size: string = this.DEFAULT_POSTER_SIZE): string {
    if (!path) {
      return "";
    }

    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;

    return `${this.IMAGE_BASE_URL}${size}/${cleanPath}`;
  }

  /**
   * Get full poster URL for a given poster path
   */
  getPosterUrl(
    posterPath?: string,
    size: string = this.DEFAULT_POSTER_SIZE
  ): string {
    if (!posterPath) {
      return "";
    }
    return this.getImageUrl(posterPath, size);
  }

  /**
   * Transform TMDB search result to SelectedMedia format
   */
  transformToSelectedMedia(result: TMDBSearchResult): SelectedMedia {
    const title = result.title || result.name || "";
    const releaseDate = result.release_date || result.first_air_date;

    return {
      tmdb_id: result.id,
      media_type: result.media_type,
      media_title: title,
      poster_path: result.poster_path || undefined,
      release_date: releaseDate || undefined,
      runtime: result.runtime || result.episode_run_time?.[0] || undefined,
    };
  }

  /**
   * Get available poster sizes
   */
  getAvailablePosterSizes(): string[] {
    return ["w92", "w154", "w185", "w342", "w500", "w780", "original"];
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached search results
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const tmdbService = new TMDBService();

// Export class for testing
export { TMDBService };
