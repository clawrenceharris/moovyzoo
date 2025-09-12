"use client";

import { useCallback } from 'react';
import { useWatchHistory } from './use-watch-history';
import type { TMDBMovie, TMDBTVShow, TMDBMovieDetails, TMDBTVShowDetails } from '@/features/ai-chat/data/tmdb.repository';

/**
 * TMDB interaction tracking data
 */
export interface TMDBInteraction {
  action: 'view' | 'search' | 'details' | 'similar';
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle: string;
  posterPath?: string;
}

/**
 * Watch status options for tracking
 */
export type WatchStatus = 'watched' | 'watching' | 'dropped';

/**
 * Hook for tracking TMDB API interactions and integrating with watch history
 * Provides seamless integration between TMDB data and user watch tracking
 */
export function useTMDBTracking() {
  const watchHistory = useWatchHistory();

  /**
   * Track a movie from TMDB data
   */
  const trackMovie = useCallback(
    async (
      movie: TMDBMovie | TMDBMovieDetails,
      status: WatchStatus,
      rating?: number
    ) => {
      await watchHistory.quickTrack(
        {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
        },
        'movie',
        status,
        rating
      );
    },
    [watchHistory]
  );

  /**
   * Track a TV show from TMDB data
   */
  const trackTVShow = useCallback(
    async (
      tvShow: TMDBTVShow | TMDBTVShowDetails,
      status: WatchStatus,
      rating?: number
    ) => {
      await watchHistory.quickTrack(
        {
          id: tvShow.id,
          name: tvShow.name,
          poster_path: tvShow.poster_path,
        },
        'tv',
        status,
        rating
      );
    },
    [watchHistory]
  );

  /**
   * Track any TMDB media (auto-detects type)
   */
  const trackMedia = useCallback(
    async (
      media: (TMDBMovie | TMDBMovieDetails | TMDBTVShow | TMDBTVShowDetails) & { media_type?: 'movie' | 'tv' },
      status: WatchStatus,
      rating?: number
    ) => {
      // Determine media type
      let mediaType: 'movie' | 'tv';
      
      if (media.media_type) {
        mediaType = media.media_type;
      } else if ('title' in media) {
        mediaType = 'movie';
      } else if ('name' in media) {
        mediaType = 'tv';
      } else {
        throw new Error('Unable to determine media type');
      }

      await watchHistory.quickTrack(
        {
          id: media.id,
          title: 'title' in media ? media.title : undefined,
          name: 'name' in media ? media.name : undefined,
          poster_path: media.poster_path,
        },
        mediaType,
        status,
        rating
      );
    },
    [watchHistory]
  );

  /**
   * Mark movie as watched with optional rating
   */
  const markMovieAsWatched = useCallback(
    async (movie: TMDBMovie | TMDBMovieDetails, rating?: number) => {
      await trackMovie(movie, 'watched', rating);
    },
    [trackMovie]
  );

  /**
   * Mark TV show as watched with optional rating
   */
  const markTVShowAsWatched = useCallback(
    async (tvShow: TMDBTVShow | TMDBTVShowDetails, rating?: number) => {
      await trackTVShow(tvShow, 'watched', rating);
    },
    [trackTVShow]
  );

  /**
   * Mark movie as currently watching
   */
  const markMovieAsWatching = useCallback(
    async (movie: TMDBMovie | TMDBMovieDetails) => {
      await trackMovie(movie, 'watching');
    },
    [trackMovie]
  );

  /**
   * Mark TV show as currently watching
   */
  const markTVShowAsWatching = useCallback(
    async (tvShow: TMDBTVShow | TMDBTVShowDetails) => {
      await trackTVShow(tvShow, 'watching');
    },
    [trackTVShow]
  );

  /**
   * Mark movie as dropped
   */
  const markMovieAsDropped = useCallback(
    async (movie: TMDBMovie | TMDBMovieDetails) => {
      await trackMovie(movie, 'dropped');
    },
    [trackMovie]
  );

  /**
   * Mark TV show as dropped
   */
  const markTVShowAsDropped = useCallback(
    async (tvShow: TMDBTVShow | TMDBTVShowDetails) => {
      await trackTVShow(tvShow, 'dropped');
    },
    [trackTVShow]
  );

  /**
   * Rate a movie (automatically marks as watched if not already tracked)
   */
  const rateMovie = useCallback(
    async (movie: TMDBMovie | TMDBMovieDetails, rating: number) => {
      if (rating < 1 || rating > 10) {
        throw new Error('Rating must be between 1 and 10');
      }
      await trackMovie(movie, 'watched', rating);
    },
    [trackMovie]
  );

  /**
   * Rate a TV show (automatically marks as watched if not already tracked)
   */
  const rateTVShow = useCallback(
    async (tvShow: TMDBTVShow | TMDBTVShowDetails, rating: number) => {
      if (rating < 1 || rating > 10) {
        throw new Error('Rating must be between 1 and 10');
      }
      await trackTVShow(tvShow, 'watched', rating);
    },
    [trackTVShow]
  );

  /**
   * Batch track multiple items (useful for "add to favorites" or bulk operations)
   */
  const batchTrack = useCallback(
    async (
      items: Array<{
        media: TMDBMovie | TMDBMovieDetails | TMDBTVShow | TMDBTVShowDetails;
        mediaType: 'movie' | 'tv';
        status: WatchStatus;
        rating?: number;
      }>
    ) => {
      const promises = items.map(({ media, mediaType, status, rating }) =>
        watchHistory.quickTrack(
          {
            id: media.id,
            title: 'title' in media ? media.title : undefined,
            name: 'name' in media ? media.name : undefined,
            poster_path: media.poster_path,
          },
          mediaType,
          status,
          rating
        )
      );

      await Promise.all(promises);
    },
    [watchHistory]
  );

  /**
   * Enhanced TMDB API wrapper that automatically tracks interactions
   * Use this to wrap existing TMDB API calls for automatic tracking
   */
  const withTracking = useCallback(
    <T extends TMDBMovie | TMDBTVShow | TMDBMovieDetails | TMDBTVShowDetails>(
      apiCall: () => Promise<T>,
      options?: {
        autoTrack?: boolean;
        trackAsWatching?: boolean;
        mediaType?: 'movie' | 'tv';
      }
    ) => {
      return async (): Promise<T> => {
        const result = await apiCall();
        
        // Auto-track if enabled
        if (options?.autoTrack) {
          const mediaType = options.mediaType || 
            ('title' in result ? 'movie' : 'tv');
          
          const status = options.trackAsWatching ? 'watching' : 'watched';
          
          // Track in background without blocking the API response
          watchHistory.quickTrack(
            {
              id: result.id,
              title: 'title' in result ? result.title : undefined,
              name: 'name' in result ? result.name : undefined,
              poster_path: result.poster_path,
            },
            mediaType,
            status
          ).catch(error => {
            console.warn('Failed to track TMDB interaction:', error);
          });
        }
        
        return result;
      };
    },
    [watchHistory]
  );

  return {
    // State from underlying watch history hook
    isLoading: watchHistory.isLoading,
    error: watchHistory.error,
    isSuccess: watchHistory.isSuccess,

    // Movie tracking
    trackMovie,
    markMovieAsWatched,
    markMovieAsWatching,
    markMovieAsDropped,
    rateMovie,

    // TV show tracking
    trackTVShow,
    markTVShowAsWatched,
    markTVShowAsWatching,
    markTVShowAsDropped,
    rateTVShow,

    // Generic tracking
    trackMedia,
    batchTrack,

    // API integration
    withTracking,

    // Reset state
    reset: watchHistory.reset,
  };
}