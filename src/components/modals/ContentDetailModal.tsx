"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Star, Calendar, Clock, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, VisuallyHidden } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/states';
import { WatchHistoryTracker } from '@/features/profile/components/WatchHistoryTracker';
import { 
  getMovieDetails, 
  getTVShowDetails, 
  getImageUrl,
  type TMDBMovieDetails,
  type TMDBTVShowDetails 
} from '@/features/ai-chat/data/tmdb.repository';
import type { ContentRecommendation } from '@/features/ai-recommendations/types/recommendations';
import { cn } from '@/lib/utils';

/**
 * Props for the ContentDetailModal component
 */
export interface ContentDetailModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Content recommendation data */
  recommendation: ContentRecommendation;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ContentDetailModal component displays detailed information about a movie/TV show
 * with integrated watch history tracking functionality.
 * 
 * Features:
 * - Detailed movie/TV show information
 * - High-quality poster and backdrop images
 * - Watch history tracking with status and rating
 * - Cast and crew information
 * - Genre tags and metadata
 * - Cinematic styling with blur background
 */
export function ContentDetailModal({
  isOpen,
  onClose,
  recommendation,
  className,
}: ContentDetailModalProps) {
  const [details, setDetails] = useState<TMDBMovieDetails | TMDBTVShowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch detailed information when modal opens
  useEffect(() => {
    if (!isOpen || !recommendation) {
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let detailsData;
        if (recommendation.media_type === 'movie') {
          detailsData = await getMovieDetails(recommendation.tmdb_id);
        } else {
          detailsData = await getTVShowDetails(recommendation.tmdb_id);
        }

        setDetails(detailsData);
      } catch (err) {
        console.error('Failed to fetch content details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [isOpen, recommendation]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDetails(null);
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const getTitle = () => {
    if (!details) return recommendation.title;
    return recommendation.media_type === 'movie' 
      ? (details as TMDBMovieDetails).title 
      : (details as TMDBTVShowDetails).name;
  };

  const getReleaseDate = () => {
    if (!details) return null;
    return recommendation.media_type === 'movie' 
      ? (details as TMDBMovieDetails).release_date 
      : (details as TMDBTVShowDetails).first_air_date;
  };

  const getReleaseYear = () => {
    const releaseDate = getReleaseDate();
    return releaseDate ? new Date(releaseDate).getFullYear() : null;
  };

  const getRuntime = () => {
    if (!details || recommendation.media_type !== 'movie') return null;
    return (details as TMDBMovieDetails).runtime;
  };

  const getSeasonInfo = () => {
    if (!details || recommendation.media_type !== 'tv') return null;
    const tvDetails = details as TMDBTVShowDetails;
    return {
      seasons: tvDetails.number_of_seasons,
      episodes: tvDetails.number_of_episodes,
    };
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const posterUrl = getImageUrl(details?.poster_path || recommendation.poster_url?.split('/').pop() || null, 'w500');
  const backdropUrl = getImageUrl(details?.backdrop_path, 'original');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className={cn(
            "!w-full !max-w-[70vw] max-h-[95vh] overflow-y-auto gap-0 p-0",
            "bg-background/95 backdrop-blur-xl border-border/50",
            className
          )}
        showCloseButton={false}
      >
        {/* Accessible title for screen readers */}
        <VisuallyHidden>
          <DialogTitle>
            {recommendation ? `${getTitle()} Details` : 'Content Details'}
          </DialogTitle>
        </VisuallyHidden>
        {/* Custom close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-8 h-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Loading State */}
        {isLoading && (
          <div className="p-8">
            <LoadingState />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8">
            <ErrorState 
              message={error} 
              onRetry={() => {
                // Trigger refetch by toggling modal
                onClose();
                setTimeout(() => {
                  setError(null);
                }, 100);
              }}
            />
          </div>
        )}

        {/* Content */}
        {details && !isLoading && !error && (
          <div className="relative">
            {/* Hero Section with Backdrop */}
            <div className="relative h-64 sm:h-80 overflow-hidden">
              {backdropUrl ? (
                <Image
                  src={backdropUrl}
                  alt={`${getTitle()} backdrop`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30" />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              
              {/* Hero Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex gap-6 items-end">
                  {/* Poster */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="w-32 h-48 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={`${getTitle()} poster`}
                          width={128}
                          height={192}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Star className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title and Basic Info */}
                  <div className="flex-1 space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                      {getTitle()}
                      {getReleaseYear() && (
                        <span className="text-white/80 ml-2 font-normal">({getReleaseYear()})</span>
                      )}
                    </h1>
                    
                    {/* AI Match Score */}
                    <div className="flex items-center gap-4 text-sm text-white/90">
                      <span className="bg-accent/90 text-accent-foreground px-2 py-1 rounded-full font-medium">
                        {recommendation.match_score}% Match
                      </span>
                      
                      {/* Rating */}
                      {details.vote_average > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{details.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {/* Runtime/Season Info */}
                      {getRuntime() && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatRuntime(getRuntime()!)}</span>
                        </div>
                      )}
                      
                      {getSeasonInfo() && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{getSeasonInfo()!.seasons} seasons</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Mobile Poster */}
              <div className="sm:hidden flex gap-4">
                <div className="w-20 h-30 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={`${getTitle()} poster`}
                      width={80}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Star className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Mobile Title */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">
                    {getTitle()}
                    {getReleaseYear() && (
                      <span className="text-muted-foreground ml-2 font-normal text-lg">({getReleaseYear()})</span>
                    )}
                  </h2>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="bg-accent/20 text-accent-foreground px-2 py-1 rounded-full font-medium inline-block">
                      {recommendation.match_score}% Match
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview */}
              {details.overview && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}

              {/* AI Recommendation Explanation */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Why This Recommendation?
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {recommendation.short_explanation}
                </p>
              </div>

              {/* Genres */}
              {details.genres && details.genres.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {details.credits.cast.slice(0, 6).map((actor) => (
                      <div key={actor.id} className="text-sm">
                        <div className="font-medium text-foreground">{actor.name}</div>
                        <div className="text-muted-foreground text-xs">{actor.character}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watch History Tracker */}
              <div className="border-t pt-6">
                <WatchHistoryTracker
                  media={details}
                  mediaType={recommendation.media_type}
                  variant="full"
                  className="max-w-none"
                  onStatusChange={(status) => {
                    console.log('Status changed:', status);
                  }}
                  onRatingChange={(rating) => {
                    console.log('Rating changed:', rating);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
