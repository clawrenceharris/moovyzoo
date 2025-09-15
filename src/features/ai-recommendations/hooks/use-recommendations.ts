"use client";

import { useState, useEffect, useCallback } from "react";
import type { RecommendationsResponse, RefreshRecommendationsResponse } from "../types/recommendations";

interface UseRecommendationsReturn {
  recommendations: RecommendationsResponse["data"] | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => void;
}

/**
 * Hook for managing AI recommendations data and state
 *
 * This hook handles fetching, caching, and refreshing of both content
 * recommendations and friend suggestions. It provides loading states,
 * error handling, and a refresh mechanism.
 *
 * @example
 * ```tsx
 * const { recommendations, isLoading, error, refreshRecommendations } = useRecommendations(userId);
 *
 * if (isLoading) return <LoadingState />;
 * if (error) return <ErrorState message={error} onRetry={refreshRecommendations} />;
 *
 * return (
 *   <RecommendationsSection
 *     contentRecommendations={recommendations?.content_recommendations || []}
 *     friendSuggestions={recommendations?.friend_suggestions || []}
 *     onRefreshRecommendations={refreshRecommendations}
 *   />
 * );
 * ```
 *
 * @param userId - The user ID to fetch recommendations for
 * @returns Object containing recommendations data, loading state, error state, and refresh function
 */
export function useRecommendations(userId?: string): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) return;

    console.log(`[useRecommendations] Fetching recommendations for user: ${userId}`);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendations");
      const data: RecommendationsResponse = await response.json();

      if (!response.ok) {
        console.error(`[useRecommendations] API error for user ${userId}:`, {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          code: data.code
        });
        
        // Provide more specific error messages based on status code
        let errorMessage = data.error || "Failed to load recommendations";
        
        if (response.status === 429) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (response.status === 401) {
          errorMessage = "Please sign in to view recommendations.";
        } else if (response.status >= 500) {
          errorMessage = "Our servers are having issues. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      console.log(`[useRecommendations] Successfully fetched recommendations for user ${userId}:`, {
        contentCount: data.data.content_recommendations.length,
        friendCount: data.data.friend_suggestions.length,
        cached: data.data.cached
      });

      setRecommendations(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load recommendations";
      console.error(`[useRecommendations] Error fetching recommendations for user ${userId}:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshRecommendations = useCallback(async () => {
    if (!userId) return;

    console.log(`[useRecommendations] Refreshing recommendations for user: ${userId}`);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendations/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ force_refresh: true }),
      });

      const data: RefreshRecommendationsResponse = await response.json();

      if (!response.ok) {
        console.error(`[useRecommendations] Refresh API error for user ${userId}:`, {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          code: data.code
        });
        
        // Provide more specific error messages based on status code
        let errorMessage = data.error || "Failed to refresh recommendations";
        
        if (response.status === 429) {
          errorMessage = "You're refreshing too often. Please wait a moment and try again.";
        } else if (response.status === 401) {
          errorMessage = "Please sign in to refresh recommendations.";
        } else if (response.status >= 500) {
          errorMessage = "Our servers are having issues. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      console.log(`[useRecommendations] Successfully refreshed recommendations for user ${userId}:`, {
        contentCount: data.data.content_recommendations.length,
        friendCount: data.data.friend_suggestions.length
      });

      setRecommendations({
        content_recommendations: data.data.content_recommendations,
        friend_suggestions: data.data.friend_suggestions,
        cached: false,
        generated_at: data.data.generated_at,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh recommendations";
      console.error(`[useRecommendations] Error refreshing recommendations for user ${userId}:`, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations,
  };
}