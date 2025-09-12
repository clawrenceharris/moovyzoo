"use client";
import React from "react";
import Image from "next/image";
import { Clock, Users, Calendar, Play } from "lucide-react";
import type {
  StreamWithParticipants,
  UserParticipationStatus,
} from "../domain/stream.types";
import { getImageUrl } from "@/features/ai-chat";
import { Button } from "@/components";
import { StreamActions } from "./StreamActions";

/**
 * Props for the StreamHero component
 */
export interface StreamHeroProps {
  /** The Stream data to display */
  stream: StreamWithParticipants;
  userId: string;
  userParticipation: UserParticipationStatus;
  showBackButton?: boolean;
  onPlayClick?: () => void;
}

/**
 * StreamHero component displays the main hero section for a Stream page.
 *
 * Features:
 * - Large media poster with fallback handling
 * - Stream title, description, and scheduling information
 * - Live/upcoming/ended status indicators with proper styling
 * - Countdown timer for upcoming streams
 * - Media information (title, year, type) with proper formatting
 * - Participant count with avatar previews
 */
export function StreamHero({
  stream,
  userId,
  userParticipation,
  onPlayClick,
}: StreamHeroProps) {
  // Calculate Stream status
  const getStreamStatus = () => {
    const scheduledTime = new Date(stream.scheduled_time);
    const now = new Date();
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    if (minutesUntilStart > 30) {
      return { status: "upcoming", timeUntilStart: minutesUntilStart };
    } else if (minutesUntilStart > 0) {
      return { status: "starting_soon", timeUntilStart: minutesUntilStart };
    } else if (minutesUntilStart >= -30) {
      return { status: "live" };
    } else {
      return { status: "ended" };
    }
  };

  const { status, timeUntilStart } = getStreamStatus();

  // Format runtime
  const formatRuntime = (runtime?: number) => {
    if (!runtime) return "";
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours}h ${minutes}m`;
  };

  // Get release year
  const getReleaseYear = () => {
    if (!stream.release_date) return "";
    // Parse as UTC to avoid timezone issues
    const date = new Date(
      stream.release_date +
        (stream.release_date.includes("T") ? "" : "T00:00:00Z")
    );
    return date.getUTCFullYear().toString();
  };

  // Format countdown timer
  const formatCountdown = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Status styling
  const getStatusStyles = () => {
    switch (status) {
      case "live":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "starting_soon":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "ended":
        return "bg-muted/20 text-muted-foreground border-muted/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "live":
        return "Live";
      case "starting_soon":
        return "Starting Soon";
      case "upcoming":
        return "Upcoming";
      case "ended":
        return "Ended";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden rounded-xl bg-card border border-border/50">
      {/* Hero Background with Poster */}

      <div className="relative aspect-[21/9] sm:aspect-[16/6] overflow-hidden">
        <Button
          onClick={onPlayClick}
          className="w-[50px] h-[50px] z-99 absolute left-[50%] top-[50%] translate-[-50%] backdrop-blur-xl bg-primary-surface/50 rounded-full flex items-center justify-center"
        >
          <Play color="white" />
        </Button>
        {stream.poster_path ? (
          <Image
            src={getImageUrl(stream.poster_path, "original")!}
            alt={`${stream.media_title} poster`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 flex items-center justify-center"
            data-testid="hero-poster-fallback"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
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
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Status Indicator */}
        <div className="absolute top-4 right-4">
          <div
            className={`px-3 py-1.5 rounded-full border backdrop-blur-sm font-medium text-sm ${getStatusStyles()}`}
            data-testid="status-indicator"
          >
            {getStatusText()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-6 -mt-20 z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Media Poster (Mobile/Tablet) */}

          <div className="flex-shrink-0">
            {stream.poster_path ? (
              <div className="w-32 h-48 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={getImageUrl(stream.poster_path)!}
                  alt={`${stream.media_title} poster`}
                  width={128}
                  height={192}
                  className="object-cover w-full h-full"
                  data-testid="hero-poster"
                />
              </div>
            ) : (
              <div className="w-32 h-48 rounded-lg bg-muted/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
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
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 text-white">
            {/* Title and Media Info */}
            <div className="mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {stream.media_title}
                {getReleaseYear() && (
                  <span className="text-xl text-white/70 ml-2">
                    ({getReleaseYear()})
                  </span>
                )}
              </h1>

              {/* Media Type and Runtime */}
              <div className="flex items-center gap-3 mb-3">
                {stream.media_type && (
                  <span
                    className="px-2 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium"
                    data-testid="media-type-badge"
                  >
                    {stream.media_type === "movie" ? "Movie" : "TV Show"}
                  </span>
                )}
                {stream.runtime && (
                  <span className="text-white/70 text-sm">
                    {formatRuntime(stream.runtime)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {stream.description && (
              <p className="text-white/80 text-lg mb-6 line-clamp-3">
                {stream.description}
              </p>
            )}

            {/* Scheduling and Participation Info */}
            <div className="flex flex-wrap items-center gap-6 mb-4">
              {/* Scheduled Time */}
              <div
                className="flex items-center gap-2"
                data-testid="scheduled-time"
              >
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-white/90">
                  {new Date(stream.scheduled_time).toLocaleDateString()} at{" "}
                  {new Date(stream.scheduled_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Participant Count */}
              <div
                className="flex items-center gap-2"
                data-testid="participant-count"
              >
                <Users className="w-5 h-5 text-accent" />
                <span className="text-white/90">
                  {stream.participants.length} participants
                </span>
              </div>
            </div>

            {/* Countdown Timer for Upcoming Streams */}
            {status === "upcoming" && timeUntilStart && timeUntilStart > 0 && (
              <div
                className="flex items-center gap-2 mb-4"
                data-testid="countdown-timer"
              >
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">
                  Starts in {formatCountdown(timeUntilStart)}
                </span>
              </div>
            )}
            <StreamActions
              userId={userId}
              stream={stream}
              userParticipation={userParticipation}
            />
            {/* Participant Avatars Preview */}
            {stream.participants && stream.participants.length > 0 && (
              <div
                className="flex items-center gap-3"
                data-testid="participant-avatars"
              >
                <div className="flex -space-x-2">
                  {stream.participants.slice(0, 8).map((participant) => (
                    <div
                      key={participant.user_id}
                      className="w-8 h-8 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center text-xs font-medium text-accent"
                    >
                      {participant.profile?.display_name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  ))}
                  {stream.participants.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-muted/20 border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                      +{stream.participants.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-white/70 text-sm">
                  {stream.participants.length === 1
                    ? "participant"
                    : "participants"}{" "}
                  joined
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
