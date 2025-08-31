import { useState, useEffect, useCallback } from "react";
import { tmdbService, TMDBSearchResult } from "@/utils/tmdb/service";
import { useDebouncedSearch } from "./useDebounce";

export interface UseMediaSearchResult {
  results: TMDBSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (query: string) => void;
  clearResults: () => void;
  retry: () => void;
}

/**
 * Custom hook for TMDB media search with debouncing and error handling
 */
export function useMediaSearch(): UseMediaSearchResult {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { debouncedTerm, shouldSearch } = useDebouncedSearch(query, 300, 3);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await tmdbService.searchMedia(searchTerm);
      setResults(searchResults);
      setHasSearched(true);
    } catch (err) {
      console.error("Media search error:", err);

      let errorMessage = "Failed to search for media. Please try again.";

      if (err instanceof Error) {
        switch (err.message) {
          case "TMDB_RATE_LIMIT_EXCEEDED":
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
            break;
          case "TMDB_UNAUTHORIZED":
            errorMessage =
              "Unable to access movie database. Please contact support.";
            break;
          case "TMDB_NETWORK_ERROR":
            errorMessage =
              "Network error. Please check your connection and try again.";
            break;
          case "TMDB_SEARCH_FAILED":
          default:
            errorMessage = "Search failed. Please try again.";
            break;
        }
      }

      setError(errorMessage);
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced term changes
  useEffect(() => {
    if (shouldSearch) {
      performSearch(debouncedTerm);
    } else if (debouncedTerm.length === 0) {
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  }, [debouncedTerm, shouldSearch, performSearch]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearResults = useCallback(() => {
    setQuery("");
    setResults([]);
    setError(null);
    setHasSearched(false);
  }, []);

  const retry = useCallback(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  return {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    clearResults,
    retry,
  };
}
