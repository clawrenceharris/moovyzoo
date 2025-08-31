import React from "react";
import type { WatchPartyWithParticipants } from "@/features/habitats/domain/habitats.types";
import { tmdbService } from "@/utils/tmdb/service";

/**
 * Props for the WatchPartyCard component
 */
export interface WatchPartyCardProps {
  /** The watch party data to display */
  watchParty: WatchPartyWithParticipants;
  /** Callback when the card is clicked */
  onClick: () => void;
  /** Whether to show the watch party description */
  showDescription?: boolean;
  /** Whether to show media information (poster, title, etc.) */
  showMediaInfo?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * WatchPartyCard component displays watch party information with status, scheduling, and media content.
 *
 * This component renders watch party details including title, scheduled time,
 * participant count, real-time status (Live/Upcoming/Ended), and associated media
 * content with poster images, media titles, and type badges. It provides
 * dynamic status indicators and participation feedback with rich media display.
 *
 * @example
 * ```tsx
 * // Basic watch party card with media
 * <WatchPartyCard
 *   watchParty={partyData}
 *   onClick={() => router.push(`/watch-parties/${partyData.id}`)}
 *   showMediaInfo={true}
 * />
 *
 * // Without description but with media
 * <WatchPartyCard
 *   watchParty={partyData}
 *   onClick={handleJoin}
 *   showDescription={false}
 *   showMediaInfo={true}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable watch party card with status indicators, scheduling info, and media content
 */
export function WatchPartyCard({
  watchParty,
  onClick,
  showDescription = true,
  showMediaInfo = true,
  className = "",
}: WatchPartyCardProps) {
  const scheduledTime = new Date(watchParty.scheduled_time);
  const now = new Date();
  const isUpcoming = scheduledTime > now;
  const isLive =
    Math.abs(scheduledTime.getTime() - now.getTime()) <= 30 * 60 * 1000; // Within 30 minutes (inclusive)

  const getStatus = () => {
    if (isLive) return { text: "Live", color: "text-green-500" };
    if (isUpcoming) return { text: "Upcoming", color: "text-blue-500" };
    return { text: "Ended", color: "text-muted-foreground" };
  };

  const status = getStatus();

  // Media-related helper functions
  const hasMedia = Boolean(
    watchParty.tmdb_id && watchParty.media_type && watchParty.media_title
  );

  const getPosterUrl = () => {
    if (!watchParty.poster_path) return "";
    return tmdbService.getPosterUrl(watchParty.poster_path, "w342");
  };

  const getMediaTypeDisplay = () => {
    if (!watchParty.media_type) return "";
    return watchParty.media_type === "movie" ? "Movie" : "TV Show";
  };

  const getReleaseYear = () => {
    if (!watchParty.release_date) return "";
    return new Date(watchParty.release_date).getFullYear().toString();
  };

  const getMediaTitle = () => {
    return watchParty.media_title || "";
  };

  const getRuntimeDisplay = () => {
    if (!watchParty.runtime) return "";
    const hours = Math.floor(watchParty.runtime / 60);
    const minutes = watchParty.runtime % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group ${className}`}
      data-testid="watch-party-card"
    >
      {/* Media Section - Only show if media exists and showMediaInfo is true */}
      {showMediaInfo && hasMedia && (
        <div className="flex gap-3 mb-3">
          {/* Poster Image */}
          <div className="flex-shrink-0">
            {getPosterUrl() ? (
              <img
                src={getPosterUrl()}
                alt={`${getMediaTitle()} poster`}
                className="w-16 h-24 sm:w-20 sm:h-30 object-cover rounded-md bg-muted"
                onError={(e) => {
                  // Fallback to placeholder on image load error
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
                data-testid="watch-party-poster"
              />
            ) : null}
            {/* Fallback placeholder */}
            <div
              className={`w-16 h-24 sm:w-20 sm:h-30 bg-muted rounded-md flex items-center justify-center ${
                getPosterUrl() ? "hidden" : ""
              }`}
              data-testid="watch-party-poster-fallback"
            >
              <svg
                className="w-6 h-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4m0 0H5a1 1 0 00-1 1v14a1 1 0 001 1h2m0 0h10"
                />
              </svg>
            </div>
          </div>

          {/* Media Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h5
                className="font-medium text-sm text-foreground line-clamp-1"
                data-testid="watch-party-media-title"
              >
                {getMediaTitle()}
              </h5>
              <span
                className={`text-xs font-medium ${status.color} ml-2 flex-shrink-0`}
                data-testid="watch-party-status"
              >
                {status.text}
              </span>
            </div>

            {/* Media badges and info */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent"
                data-testid="watch-party-media-type"
              >
                {getMediaTypeDisplay()}
              </span>
              {getReleaseYear() && (
                <span
                  className="text-xs text-muted-foreground"
                  data-testid="watch-party-release-year"
                >
                  {getReleaseYear()}
                </span>
              )}
              {getRuntimeDisplay() && (
                <span
                  className="text-xs text-muted-foreground"
                  data-testid="watch-party-runtime"
                >
                  {getRuntimeDisplay()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Watch Party Title and Status - Only show status here if no media */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {watchParty.title}
        </h4>
        {(!showMediaInfo || !hasMedia) && (
          <span
            className={`text-xs font-medium ${status.color}`}
            data-testid="watch-party-status"
          >
            {status.text}
          </span>
        )}
      </div>

      {/* Description */}
      {showDescription && watchParty.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {watchParty.description}
        </p>
      )}

      {/* Footer with scheduling and participation info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span data-testid="watch-party-date">
            {scheduledTime.toLocaleDateString()}
          </span>
          <span data-testid="watch-party-time">
            {scheduledTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span data-testid="watch-party-participants">
            {watchParty.participant_count} joined
          </span>
        </div>
        <span
          className="text-accent ml-2 flex-shrink-0"
          data-testid="watch-party-action"
        >
          {watchParty.is_participant ? "Joined →" : "Join party →"}
        </span>
      </div>
    </div>
  );
}
