"use client";

import React, { useState } from 'react';
import { Star, Play, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useTMDBTracking } from '../hooks/use-tmdb-tracking';
import type { TMDBMovie, TMDBTVShow, TMDBMovieDetails, TMDBTVShowDetails } from '@/features/ai-chat/data/tmdb.repository';
import { cn } from '@/lib/utils';

/**
 * Props for WatchHistoryTracker component
 */
export interface WatchHistoryTrackerProps {
  media: TMDBMovie | TMDBTVShow | TMDBMovieDetails | TMDBTVShowDetails;
  mediaType: 'movie' | 'tv';
  className?: string;
  variant?: 'compact' | 'full';
  onStatusChange?: (status: 'watched' | 'watching' | 'dropped' | null) => void;
  onRatingChange?: (rating: number | null) => void;
}

/**
 * Component for tracking watch history with status and rating controls
 * Provides UI for marking movies/TV shows as watched, watching, or dropped
 */
export function WatchHistoryTracker({
  media,
  mediaType,
  className,
  variant = 'full',
  onStatusChange,
  onRatingChange,
}: WatchHistoryTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<'watched' | 'watching' | 'dropped' | null>(null);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);

  const {
    trackMedia,
    rateMovie,
    rateTVShow,
    isLoading,
    error,
    isSuccess,
  } = useTMDBTracking();

  /**
   * Handle status change
   */
  const handleStatusChange = async (status: 'watched' | 'watching' | 'dropped') => {
    try {
      await trackMedia(media, status);
      setCurrentStatus(status);
      onStatusChange?.(status);
      
      // Show rating input for watched items
      if (status === 'watched') {
        setShowRating(true);
      } else {
        setShowRating(false);
        setCurrentRating(null);
      }
    } catch (err) {
      console.error('Failed to update watch status:', err);
    }
  };

  /**
   * Handle rating change
   */
  const handleRatingChange = async (rating: number) => {
    try {
      if (mediaType === 'movie') {
        await rateMovie(media as TMDBMovie | TMDBMovieDetails, rating);
      } else {
        await rateTVShow(media as TMDBTVShow | TMDBTVShowDetails, rating);
      }
      
      setCurrentRating(rating);
      setCurrentStatus('watched'); // Rating implies watched
      onRatingChange?.(rating);
      onStatusChange?.('watched');
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  /**
   * Clear status and rating
   */
  const handleClear = () => {
    setCurrentStatus(null);
    setCurrentRating(null);
    setShowRating(false);
    onStatusChange?.(null);
    onRatingChange?.(null);
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Quick action buttons */}
        <Button
          variant={currentStatus === 'watched' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange('watched')}
          disabled={isLoading}
          className="h-8 px-2"
        >
          {isLoading && currentStatus === 'watched' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </Button>

        <Button
          variant={currentStatus === 'watching' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange('watching')}
          disabled={isLoading}
          className="h-8 px-2"
        >
          {isLoading && currentStatus === 'watching' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>

        {currentStatus && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 px-2 text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Selection */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Track Progress</h4>
        <div className="flex gap-2">
          <Button
            variant={currentStatus === 'watched' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('watched')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && currentStatus === 'watched' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Watched
          </Button>

          <Button
            variant={currentStatus === 'watching' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('watching')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && currentStatus === 'watching' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 " />
            )}
            Watching
          </Button>

          <Button
            variant={currentStatus === 'dropped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('dropped')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && currentStatus === 'dropped' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            Dropped
          </Button>
        </div>
      </div>

      {/* Rating Section */}
      {(showRating || currentRating) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Rate this {mediaType}</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                disabled={isLoading}
                className={cn(
                  "p-1 rounded transition-colors",
                  "hover:bg-accent/20 disabled:opacity-50",
                  currentRating && rating <= currentRating
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                )}
                aria-label={`Rate ${rating} out of 10`}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    currentRating && rating <= currentRating
                      ? "fill-current"
                      : ""
                  )}
                />
              </button>
            ))}
            {currentRating && (
              <span className="ml-2 text-sm text-muted-foreground">
                {currentRating}/10
              </span>
            )}
          </div>
        </div>
      )}

      {/* Clear Button */}
      {currentStatus && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground"
        >
          Clear Status
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-destructive">
          Failed to update: {error.message}
        </div>
      )}

      {/* Success Feedback */}
      {isSuccess && !isLoading && (
        <div className="text-sm text-green-600">
          Updated successfully!
        </div>
      )}
    </div>
  );
}

/**
 * Simplified rating component for quick rating without status tracking
 */
export interface QuickRatingProps {
  media: TMDBMovie | TMDBTVShow | TMDBMovieDetails | TMDBTVShowDetails;
  mediaType: 'movie' | 'tv';
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function QuickRating({
  media,
  mediaType,
  onRatingChange,
  className,
}: QuickRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const { rateMovie, rateTVShow, isLoading } = useTMDBTracking();

  const handleRating = async (newRating: number) => {
    try {
      if (mediaType === 'movie') {
        await rateMovie(media as TMDBMovie | TMDBMovieDetails, newRating);
      } else {
        await rateTVShow(media as TMDBTVShow | TMDBTVShowDetails, newRating);
      }
      
      setRating(newRating);
      onRatingChange?.(newRating);
    } catch (err) {
      console.error('Failed to rate:', err);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starRating) => (
        <button
          key={starRating}
          onClick={() => handleRating(starRating)}
          onMouseEnter={() => setHoveredRating(starRating)}
          onMouseLeave={() => setHoveredRating(null)}
          disabled={isLoading}
          className={cn(
            "p-1 rounded transition-colors",
            "hover:bg-accent/20 disabled:opacity-50",
            (hoveredRating && starRating <= hoveredRating) ||
            (rating && starRating <= rating)
              ? "text-yellow-500"
              : "text-muted-foreground"
          )}
          aria-label={`Rate ${starRating} out of 10`}
        >
          <Star
            className={cn(
              "h-3 w-3",
              (hoveredRating && starRating <= hoveredRating) ||
              (rating && starRating <= rating)
                ? "fill-current"
                : ""
            )}
          />
        </button>
      ))}
      {isLoading && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
    </div>
  );
}