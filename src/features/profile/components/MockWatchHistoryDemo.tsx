"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { WatchHistoryTracker } from './WatchHistoryTracker';
import { getTrendingNowOrUpcoming, getImageUrl, type TMDBMovie } from '@/features/ai-chat/data/tmdb.repository';
import { LoadingState, ErrorState } from '@/components/states';

/**
 * Mock component to demonstrate WatchHistoryTracker functionality
 * Fetches a trending movie and displays it with tracking controls
 */
export function MockWatchHistoryDemo() {
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingMovie = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch trending movies
        const trendingMovies = await getTrendingNowOrUpcoming('trending');
        
        if (trendingMovies.length > 0) {
          // Get the first trending movie
          setMovie(trendingMovies[0]);
        } else {
          setError('No trending movies found');
        }
      } catch (err) {
        console.error('Failed to fetch trending movie:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch movie');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingMovie();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingState />
      </Card>
    );
  }

  if (error || !movie) {
    return (
      <Card className="p-6">
        <ErrorState 
          message={error || 'No movie data available'} 
          onRetry={() => window.location.reload()}
        />
      </Card>
    );
  }

  const posterUrl = getImageUrl(movie.poster_path, 'w300');
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

  return (
    <Card className="p-6 space-y-4 max-w-2xl">

      <div className="flex gap-4">
        {/* Movie Poster */}
        {posterUrl && (
          <div className="flex-shrink-0">
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              className="w-24 h-36 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Movie Info and Tracker */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-medium text-base">
              {movie.title}
              {releaseYear && (
                <span className="text-muted-foreground ml-2">({releaseYear})</span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>⭐ {movie.vote_average.toFixed(1)}/10</span>
              <span>•</span>
              <span>{movie.vote_count.toLocaleString()} votes</span>
            </div>
          </div>

          {movie.overview && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {movie.overview}
            </p>
          )}

          {/* Watch History Tracker */}
          <div className="pt-2 border-t">
            <WatchHistoryTracker
              media={movie}
              mediaType="movie"
              variant="full"
              onStatusChange={(status) => {
                // Handle status change
              }}
              onRatingChange={(rating) => {
                // Handle rating change
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}