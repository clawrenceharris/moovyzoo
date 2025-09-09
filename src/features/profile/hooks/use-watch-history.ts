"use client";

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { WatchHistoryEntry } from '../domain/profiles.types';

/**
 * Input data for adding/updating watch history
 */
export interface AddWatchHistoryData {
  movieId: string;
  title: string;
  posterUrl?: string;
  mediaType: 'movie' | 'tv';
  status: 'watched' | 'watching' | 'dropped';
  rating?: number;
  watchedAt?: Date;
}

/**
 * API response for watch history operations
 */
interface WatchHistoryApiResponse {
  success: boolean;
  data: {
    id: string;
    movieId: string;
    title: string;
    posterUrl?: string;
    mediaType: 'movie' | 'tv';
    status: 'watched' | 'watching' | 'dropped';
    rating?: number;
    watchedAt: string;
  };
}

/**
 * Hook for managing user's watch history
 * Provides functionality to add, update, and track viewing activity
 */
export function useWatchHistory() {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Add or update a watch history entry
   */
  const addWatchEntryMutation = useMutation({
    mutationFn: async (data: AddWatchHistoryData): Promise<WatchHistoryEntry> => {
      const response = await fetch('/api/watch-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: data.movieId,
          title: data.title,
          posterUrl: data.posterUrl,
          mediaType: data.mediaType,
          status: data.status,
          rating: data.rating,
          watchedAt: data.watchedAt?.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add watch history entry');
      }

      const result: WatchHistoryApiResponse = await response.json();
      
      // Convert API response to WatchHistoryEntry
      return {
        id: result.data.id,
        userId: '', // Will be set by server
        movieId: result.data.movieId,
        title: result.data.title,
        posterUrl: result.data.posterUrl,
        mediaType: result.data.mediaType,
        status: result.data.status,
        rating: result.data.rating,
        watchedAt: new Date(result.data.watchedAt),
      };
    },
    onSuccess: () => {
      // Invalidate watch history queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['watch-history'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  /**
   * Track a movie/TV show as watched
   * Convenience method for marking content as watched
   */
  const trackAsWatched = useCallback(
    async (data: {
      movieId: string;
      title: string;
      posterUrl?: string;
      mediaType: 'movie' | 'tv';
      rating?: number;
    }) => {
      setIsTracking(true);
      try {
        await addWatchEntryMutation.mutateAsync({
          ...data,
          status: 'watched',
          watchedAt: new Date(),
        });
      } finally {
        setIsTracking(false);
      }
    },
    [addWatchEntryMutation]
  );

  /**
   * Track a movie/TV show as currently watching
   */
  const trackAsWatching = useCallback(
    async (data: {
      movieId: string;
      title: string;
      posterUrl?: string;
      mediaType: 'movie' | 'tv';
    }) => {
      setIsTracking(true);
      try {
        await addWatchEntryMutation.mutateAsync({
          ...data,
          status: 'watching',
          watchedAt: new Date(),
        });
      } finally {
        setIsTracking(false);
      }
    },
    [addWatchEntryMutation]
  );

  /**
   * Track a movie/TV show as dropped
   */
  const trackAsDropped = useCallback(
    async (data: {
      movieId: string;
      title: string;
      posterUrl?: string;
      mediaType: 'movie' | 'tv';
    }) => {
      setIsTracking(true);
      try {
        await addWatchEntryMutation.mutateAsync({
          ...data,
          status: 'dropped',
          watchedAt: new Date(),
        });
      } finally {
        setIsTracking(false);
      }
    },
    [addWatchEntryMutation]
  );

  /**
   * Update rating for an existing watch history entry
   */
  const updateRating = useCallback(
    async (data: {
      movieId: string;
      title: string;
      posterUrl?: string;
      mediaType: 'movie' | 'tv';
      rating: number;
      currentStatus?: 'watched' | 'watching' | 'dropped';
    }) => {
      setIsTracking(true);
      try {
        await addWatchEntryMutation.mutateAsync({
          movieId: data.movieId,
          title: data.title,
          posterUrl: data.posterUrl,
          mediaType: data.mediaType,
          status: data.currentStatus || 'watched',
          rating: data.rating,
          watchedAt: new Date(),
        });
      } finally {
        setIsTracking(false);
      }
    },
    [addWatchEntryMutation]
  );

  /**
   * Quick track function for TMDB API integration
   * Automatically extracts necessary data from TMDB responses
   */
  const quickTrack = useCallback(
    async (
      tmdbData: {
        id: number;
        title?: string;
        name?: string;
        poster_path?: string;
      },
      mediaType: 'movie' | 'tv',
      status: 'watched' | 'watching' | 'dropped',
      rating?: number
    ) => {
      const title = tmdbData.title || tmdbData.name || '';
      const posterUrl = tmdbData.poster_path 
        ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
        : undefined;

      setIsTracking(true);
      try {
        await addWatchEntryMutation.mutateAsync({
          movieId: tmdbData.id.toString(),
          title,
          posterUrl,
          mediaType,
          status,
          rating,
          watchedAt: new Date(),
        });
      } finally {
        setIsTracking(false);
      }
    },
    [addWatchEntryMutation]
  );

  return {
    // Mutation state
    isLoading: addWatchEntryMutation.isPending || isTracking,
    error: addWatchEntryMutation.error,
    isSuccess: addWatchEntryMutation.isSuccess,

    // Actions
    addWatchEntry: addWatchEntryMutation.mutateAsync,
    trackAsWatched,
    trackAsWatching,
    trackAsDropped,
    updateRating,
    quickTrack,

    // Reset mutation state
    reset: addWatchEntryMutation.reset,
  };
}

/**
 * Hook for fetching user's watch history
 * Provides paginated access to watch history data
 */
export function useUserWatchHistory(userId?: string, limit = 20) {
  return useQuery({
    queryKey: ['watch-history', userId, limit],
    queryFn: async (): Promise<WatchHistoryEntry[]> => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/watch-history?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch watch history');
      }

      const data = await response.json();
      return data.entries || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for getting recent watch activity
 * Used for profile displays and activity feeds
 */
export function useRecentWatchActivity(userId?: string, limit = 5) {
  return useQuery({
    queryKey: ['watch-history', 'recent', userId, limit],
    queryFn: async (): Promise<WatchHistoryEntry[]> => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      params.append('limit', limit.toString());
      params.append('recent', 'true');

      const response = await fetch(`/api/watch-history?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const data = await response.json();
      return data.entries || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}