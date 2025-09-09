"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { WatchHistoryTracker, QuickRating } from './WatchHistoryTracker';
import type { TMDBMovie, TMDBTVShow, TMDBMovieDetails, TMDBTVShowDetails } from '@/features/ai-chat/data/tmdb.repository';
import { cn } from '@/lib/utils';

/**
 * Props for MediaWithTracking component
 */
export interface MediaWithTrackingProps {
  media: TMDBMovie | TMDBTVShow | TMDBMovieDetails | TMDBTVShowDetails;
  mediaType: 'movie' | 'tv';
  className?: string;
  showTracker?: boolean;
  trackerVariant?: 'compact' | 'full';
  children?: React.ReactNode;
}

/**
 * Wrapper component that adds watch history tracking to any media display
 * Can be used to enhance existing movie/TV show cards with tracking functionality
 */
export function MediaWithTracking({
  media,
  mediaType,
  className,
  showTracker = true,
  trackerVariant = 'compact',
  children,
}: MediaWithTrackingProps) {
  const [watchStatus, setWatchStatus] = useState<'watched' | 'watching' | 'dropped' | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w300${media.poster_path}`
    : null;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Media Content */}
      <div className="p-4">
        {children || (
          <div className="space-y-3">
            {/* Basic Media Info */}
            <div className="flex gap-3">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={`${title} poster`}
                  className="w-16 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {title}
                </h3>
                {year && (
                  <p className="text-xs text-muted-foreground">
                    {year}
                  </p>
                )}
                {media.vote_average > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ⭐ {media.vote_average.toFixed(1)}/10
                  </p>
                )}
                {watchStatus && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      watchStatus === 'watched' && "bg-green-100 text-green-800",
                      watchStatus === 'watching' && "bg-blue-100 text-blue-800",
                      watchStatus === 'dropped' && "bg-red-100 text-red-800"
                    )}>
                      {watchStatus}
                    </span>
                    {rating && (
                      <span className="text-xs text-muted-foreground">
                        ⭐ {rating}/10
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Watch History Tracker */}
        {showTracker && (
          <div className="mt-3 pt-3 border-t">
            <WatchHistoryTracker
              media={media}
              mediaType={mediaType}
              variant={trackerVariant}
              onStatusChange={setWatchStatus}
              onRatingChange={setRating}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Enhanced media search result with tracking
 * Drop-in replacement for search result items
 */
export interface MediaSearchResultWithTrackingProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: 'movie' | 'tv';
  onSelect?: (media: TMDBMovie | TMDBTVShow) => void;
  className?: string;
}

export function MediaSearchResultWithTracking({
  media,
  mediaType,
  onSelect,
  className,
}: MediaSearchResultWithTrackingProps) {
  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w92${media.poster_path}`
    : null;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 hover:bg-accent/50 cursor-pointer rounded-lg transition-colors",
        className
      )}
      onClick={() => onSelect?.(media)}
    >
      {/* Poster */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt={`${title} poster`}
          className="w-12 h-18 object-cover rounded"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {title}
        </h4>
        {year && (
          <p className="text-xs text-muted-foreground">
            {year} • {mediaType === 'movie' ? 'Movie' : 'TV Show'}
          </p>
        )}
        {media.vote_average > 0 && (
          <p className="text-xs text-muted-foreground">
            ⭐ {media.vote_average.toFixed(1)}/10
          </p>
        )}
      </div>

      {/* Quick Rating */}
      <div className="flex-shrink-0">
        <QuickRating
          media={media}
          mediaType={mediaType}
          className="scale-75"
        />
      </div>
    </div>
  );
}

/**
 * Bulk tracking component for multiple media items
 * Useful for "mark all as watched" functionality
 */
export interface BulkMediaTrackingProps {
  mediaItems: Array<{
    media: TMDBMovie | TMDBTVShow | TMDBMovieDetails | TMDBTVShowDetails;
    mediaType: 'movie' | 'tv';
  }>;
  onTrackingComplete?: () => void;
  className?: string;
}

export function BulkMediaTracking({
  mediaItems,
  onTrackingComplete,
  className,
}: BulkMediaTrackingProps) {
  const [isTracking, setIsTracking] = useState(false);

  const handleBulkTrack = async (status: 'watched' | 'watching' | 'dropped') => {
    setIsTracking(true);
    try {
      // This would use the batchTrack function from useTMDBTracking
      // Implementation would depend on specific requirements
      console.log('Bulk tracking:', mediaItems.length, 'items as', status);
      onTrackingComplete?.();
    } catch (error) {
      console.error('Bulk tracking failed:', error);
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium">
        Bulk Track {mediaItems.length} Items
      </h4>
      <div className="flex gap-2">
        <button
          onClick={() => handleBulkTrack('watched')}
          disabled={isTracking}
          className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
        >
          Mark All Watched
        </button>
        <button
          onClick={() => handleBulkTrack('watching')}
          disabled={isTracking}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
        >
          Mark All Watching
        </button>
      </div>
    </div>
  );
}