import React from "react";
import type { WatchPartyWithParticipants } from "@/features/habitats/domain/habitats.types";
import { getImageUrl } from "@/features/ai-chat";
import { Button } from "../ui";
import Image from "next/image";

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
    return getImageUrl(watchParty.poster_path);
  };

  const getReleaseYear = () => {
    if (!watchParty.release_date) return "";
    return new Date(watchParty.release_date).getFullYear().toString();
  };

  return (
    <div
      className={`habitat-card ${className || ""}`}
      onClick={onClick}
      data-testid="habitat-card"
    >
      {/* Banner Image */}
      <div className="habitat-card-banner">
        {getImageUrl(watchParty.poster_path) ? (
          <Image
            src={getImageUrl(watchParty.poster_path)!}
            alt={`${watchParty.media_title} poster`}
            fill
            className="object-cover"
          />
        ) : (
          // Fallback gradient background
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30" />
        )}

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

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
            {watchParty.media_title}{" "}
            {getReleaseYear() && (
              <span
                className="text-xs text-muted-foreground"
                data-testid="watch-party-release-year"
              >
                ({getReleaseYear()})
              </span>
            )}
          </h4>
          {(!showMediaInfo || !hasMedia) && (
            <span
              className={`text-xs font-medium ${status.color}`}
              data-testid="watch-party-status"
            >
              {status.text}
            </span>
          )}
          {/* Description */}
          {showDescription && watchParty.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {watchParty.description}
            </p>
          )}
        </div>
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
          {
            <Button variant={"primary"} data-testid="watch-party-action">
              {watchParty.is_participant ? "Joined →" : "Join party →"}
            </Button>
          }
        </div>
      </div>
    </div>
  );
}
