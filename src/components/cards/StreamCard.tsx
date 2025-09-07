import React from "react";
import type { StreamWithParticipants } from "@/features/streaming/domain/stream.types";
import { getImageUrl } from "@/features/ai-chat";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

/**
 * Navigation context for analytics tracking
 */
export type NavigationContext = "habitat" | "home" | "streams" | "search";

/**
 * Navigation tracking data
 */
export interface NavigationTrackingData {
  streamId: string;
  context: NavigationContext;
  destination: string;
}

/**
 * Props for the StreamCard component
 */
export interface StreamCardProps {
  /** The streaming session data to display */
  stream: StreamWithParticipants;
  href?: string;
  onJoinClick: () => void;
  onLeaveClick: () => void;
  onWatchClick: () => void;
  /** Navigation context for analytics */
  navigationContext?: NavigationContext;
  /** Callback for navigation tracking */
  onNavigationTrack?: (data: NavigationTrackingData) => void;
  /** Whether to show the streaming session description */
  showDescription?: boolean;
  /** Whether to show media information (poster, title, etc.) */
  showMediaInfo?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * StreamCard component displays streaming session information with status, scheduling, and media content.
 *
 * This component renders streaming session details including title, scheduled time,
 * participant count, real-time status (Live/Upcoming/Ended), and associated media
 * content with poster images, media titles, and type badges. It provides
 * dynamic status indicators and participation feedback with rich media display.
 *
 * @example
 * ```tsx
 * // Basic streaming session card with media
 * <StreamCard
 *   stream={partyData}
 *   onClick={() => router.push(`/streaming/${partyData.id}`)}
 *   showMediaInfo={true}
 * />
 *
 * // Without description but with media
 * <StreamCard
 *   stream={partyData}
 *   onClick={handleJoin}
 *   showDescription={false}
 *   showMediaInfo={true}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable streaming session card with status indicators, scheduling info, and media content
 */
export function StreamCard({
  stream,
  onJoinClick,
  onLeaveClick,
  onWatchClick,
  href,
  navigationContext,
  onNavigationTrack,
  showDescription = true,
  showMediaInfo = true,
  className = "",
}: StreamCardProps) {
  const scheduledTime = new Date(stream.scheduled_time);
  const now = new Date();
  const isUpcoming = scheduledTime > now;
  const isLive =
    Math.abs(scheduledTime.getTime() - now.getTime()) <= 30 * 60 * 1000; // Within 30 minutes (inclusive)

  const getStatus = () => {
    if (isLive)
      return {
        text: "Live",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    if (isUpcoming)
      return {
        text: "Upcoming",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      };
    return {
      text: "Ended",
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
    };
  };

  const status = getStatus();

  // Media-related helper functions
  const hasMedia = Boolean(
    stream.tmdb_id && stream.media_type && stream.media_title
  );

  const getPosterUrl = () => {
    if (!stream.poster_path) return "";
    return getImageUrl(stream.poster_path);
  };

  const getReleaseYear = () => {
    if (!stream.release_date) return "";
    return new Date(stream.release_date).getFullYear().toString();
  };

  // Navigation functionality
  const streamHref = href || `/streams/${stream.id}`;

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on action button
    if (
      (event.target as HTMLElement).closest('[data-testid="streaming-action"]')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Track navigation if callback provided
    if (onNavigationTrack && navigationContext) {
      onNavigationTrack({
        streamId: stream.id,
        context: navigationContext,
        destination: streamHref,
      });
    }

    onWatchClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(event as any);
    }
  };

  const ariaLabel = `Navigate to ${
    stream.media_title || "streaming session"
  } streaming session`;

  return (
    <Card className="media-card" data-testid="media-card">
      <Link href={streamHref}>
        {/* Banner Image */}
        <div className="media-card-banner">
          {getImageUrl(stream.poster_path) ? (
            <Image
              src={getImageUrl(stream.poster_path)!}
              alt={`${stream.media_title} poster`}
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
            data-testid="streaming-poster-fallback"
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

        <div className="p-6 space-y-3">
          {/* Scheduling and participation info */}
          <div className="text-xs text-muted-foreground flex items-center gap-2 sm:gap-3 flex-wrap">
            <span data-testid="streaming-date">
              {scheduledTime.toLocaleDateString()}
            </span>
            <span data-testid="streaming-time">
              {scheduledTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span data-testid="streaming-participants">
              {stream.participant_count} joined
            </span>
          </div>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {stream.media_title}{" "}
                {getReleaseYear() && (
                  <span
                    className="text-xs text-muted-foreground"
                    data-testid="streaming-release-year"
                  >
                    ({getReleaseYear()})
                  </span>
                )}
              </h4>
              {/* Description */}
              {showDescription && stream.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {stream.description}
                </p>
              )}
            </div>

            {/* Status Badge */}
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor} flex-shrink-0 ml-2`}
              data-testid="streaming-status"
            >
              {status.text}
            </div>
          </div>

          {/* Streaming Actions */}
          <div className="flex mt-8">
            {
              <Button
                variant={"primary"}
                size={"lg"}
                data-testid="streaming-action"
                disabled={stream.is_participant}
                onClick={onJoinClick}
              >
                {stream.is_participant ? "Joined" : "Join party →"}
              </Button>
            }
          </div>
        </div>
      </Link>
    </Card>
  );
}
