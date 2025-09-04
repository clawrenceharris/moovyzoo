/**
 * Base query hook with common logic and error handling
 * Provides consistent query behavior across the Habitats feature
 */

import {
  useQuery,
  UseQueryOptions,
  QueryKey,
  QueryFunction,
  UseQueryResult,
} from "@tanstack/react-query";
import { AppErrorCode } from "@/utils/error-codes";
import { normalizeError } from "@/utils/normalize-error";

/**
 * Custom error class for access denied scenarios
 */
export class AccessDeniedError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

/**
 * Custom error class for not found scenarios
 */
export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Base query configuration with sensible defaults
 */
const DEFAULT_QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: unknown) => {
    // Don't retry on access denied or not found errors
    if (error instanceof AccessDeniedError || error instanceof NotFoundError) {
      return false;
    }

    // Don't retry on client errors (4xx)
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as any).status;
      if (status >= 400 && status < 500) {
        return false;
      }
    }

    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Enhanced query options with error handling
 */
export interface BaseQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn"> {
  /**
   * Enable background refetching when window regains focus
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Enable background refetching when network reconnects
   */
  refetchOnReconnect?: boolean;

  /**
   * Custom error handler for this specific query
   */
  onError?: (error: TError) => void;
}

/**
 * Base query hook with consistent error handling and caching
 */
export function useBaseQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: BaseQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  const {
    onError,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey,
    queryFn: async (context) => {
      try {
        return await queryFn(context);
      } catch (error) {
        // Normalize error for consistent handling
        const normalizedError = normalizeError(error);

        // Call custom error handler if provided
        if (onError) {
          onError(normalizedError as TError);
        }

        // Re-throw the normalized error
        throw normalizedError;
      }
    },
    ...DEFAULT_QUERY_CONFIG,
    refetchOnWindowFocus,
    refetchOnReconnect,
    ...queryOptions,
  });
}

/**
 * Base query hook specifically for paginated data
 */
export interface PaginatedQueryOptions<TData, TError = Error>
  extends BaseQueryOptions<TData, TError> {
  /**
   * Page number (1-based)
   */
  page?: number;

  /**
   * Number of items per page
   */
  limit?: number;

  /**
   * Keep previous data while fetching new page
   */
  keepPreviousData?: boolean;
}

export function useBasePaginatedQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: PaginatedQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  const { keepPreviousData = true, ...baseOptions } = options;

  return useBaseQuery(queryKey, queryFn, {
    ...baseOptions,
    placeholderData: keepPreviousData
      ? (previousData) => previousData
      : undefined,
  });
}

/**
 * Base query hook for real-time data that should refetch frequently
 */
export function useBaseRealtimeQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: BaseQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  return useBaseQuery(queryKey, queryFn, {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchIntervalInBackground: false,
    ...options,
  });
}

/**
 * Base query hook for static data that rarely changes
 */
export function useBaseStaticQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: BaseQueryOptions<TData, TError> = {}
): UseQueryResult<TData, TError> {
  return useBaseQuery(queryKey, queryFn, {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options,
  });
}
