import { useState, useEffect, useCallback } from "react";
import { useDebouncedSearch } from "./use-debounce";
import {
  searchMulti,
  TMDBSearchResult,
} from "@/features/ai-chat/data/tmdb.repository";
import { getUserErrorMessage, normalizeError } from "@/utils/normalize-error";

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
      const searchResults = await searchMulti(searchTerm);
      setResults(searchResults);
      setHasSearched(true);
    } catch (error) {
      setError(getUserErrorMessage(error));
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
