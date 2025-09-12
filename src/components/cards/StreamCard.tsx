"use client";
import React, { useMemo, useState, useCallback } from "react";
import type { StreamWithParticipants } from "@/features/streaming/domain/stream.types";
import { getImageUrl } from "@/features/ai-chat";
import Image from "next/image";
import { Button, Card, CardFooter, CardHeader } from "../ui/";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreVertical, UserPlus, UserMinus, Bell, BellOff } from "lucide-react";

/**
 * Props for the StreamCard component
 */
export interface StreamCardProps {
  /** The Stream data to display */
  stream: StreamWithParticipants;
  href?: string;
  userId: string;
  onJoinClick: () => void;
  onLeaveClick: () => void;
  onWatchClick: () => void;
  onToggleReminder?: (streamId: string, enabled: boolean) => Promise<void>;
}

export function StreamCard({
  stream,
  userId,
  onJoinClick,
  onLeaveClick,
  onWatchClick,
  onToggleReminder,
}: StreamCardProps) {
  // Local state for loading, error handling, and optimistic updates
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticParticipantCount, setOptimisticParticipantCount] = useState<
    number | null
  >(null);
  const [optimisticIsParticipant, setOptimisticIsParticipant] = useState<
    boolean | null
  >(null);
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [optimisticReminderEnabled, setOptimisticReminderEnabled] = useState<
    boolean | null
  >(null);

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
        color: "text-accent",
        bgColor: "bg-accent/10",
      };
    return {
      text: "Ended",
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
    };
  };

  const isParticipant = useMemo(() => {
    // Use optimistic state if available, otherwise use actual data
    if (optimisticIsParticipant !== null) {
      return optimisticIsParticipant;
    }
    return stream.participants
      .map((participant) => participant.user_id)
      .includes(userId);
  }, [stream.participants, userId, optimisticIsParticipant]);

  const userParticipant = useMemo(() => {
    return stream.participants.find((p) => p.user_id === userId);
  }, [stream.participants, userId]);

  const reminderEnabled = useMemo(() => {
    if (optimisticReminderEnabled !== null) {
      return optimisticReminderEnabled;
    }
    return userParticipant?.reminder_enabled ?? false;
  }, [userParticipant, optimisticReminderEnabled]);

  const participantCount =
    optimisticParticipantCount ?? stream.participants.length;
  const status = getStatus();

  const getPosterUrl = () => {
    if (!stream.poster_path) return "";
    return getImageUrl(stream.poster_path);
  };

  const getReleaseYear = () => {
    if (!stream.release_date) return "";
    return new Date(stream.release_date).getFullYear().toString();
  };

  // Enhanced join functionality with loading states and error handling
  const handleJoinClick = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // Optimistic update
    setOptimisticIsParticipant(true);
    setOptimisticParticipantCount(stream.participants.length + 1);

    try {
      await onJoinClick();
      // Success - optimistic state will be replaced by real data
      setOptimisticIsParticipant(null);
      setOptimisticParticipantCount(null);
    } catch (err) {
      // Rollback optimistic update
      setOptimisticIsParticipant(null);
      setOptimisticParticipantCount(null);
      setError("Failed to join stream. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onJoinClick, stream.participants.length]);

  // Enhanced leave functionality with loading states and error handling
  const handleLeaveClick = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    // Optimistic update
    setOptimisticIsParticipant(false);
    setOptimisticParticipantCount(stream.participants.length - 1);

    try {
      await onLeaveClick();
      // Success - optimistic state will be replaced by real data
      setOptimisticIsParticipant(null);
      setOptimisticParticipantCount(null);
    } catch (err) {
      // Rollback optimistic update
      setOptimisticIsParticipant(null);
      setOptimisticParticipantCount(null);
      setError("Failed to leave stream. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onLeaveClick, stream.participants.length]);

  // Enhanced reminder toggle functionality with loading states and error handling
  const handleToggleReminder = useCallback(async () => {
    if (!onToggleReminder || isReminderLoading) return;

    setIsReminderLoading(true);
    setReminderError(null);

    const newReminderState = !reminderEnabled;

    // Optimistic update
    setOptimisticReminderEnabled(newReminderState);

    try {
      await onToggleReminder(stream.id, newReminderState);
      // Success - optimistic state will be replaced by real data
      setOptimisticReminderEnabled(null);
    } catch (err) {
      // Rollback optimistic update
      setOptimisticReminderEnabled(null);
      setReminderError("Failed to update reminder. Please try again.");
    } finally {
      setIsReminderLoading(false);
    }
  }, [onToggleReminder, isReminderLoading, reminderEnabled, stream.id]);

  // Retry functionality
  const handleRetry = useCallback(() => {
    setError(null);
    if (isParticipant) {
      handleLeaveClick();
    } else {
      handleJoinClick();
    }
  }, [isParticipant, handleJoinClick, handleLeaveClick]);

  // Menu action handlers
  const handleMenuJoin = useCallback(() => {
    handleJoinClick();
  }, [handleJoinClick]);

  const handleMenuLeave = useCallback(() => {
    handleLeaveClick();
  }, [handleLeaveClick]);

  const handleMenuToggleReminder = useCallback(() => {
    handleToggleReminder();
  }, [handleToggleReminder]);

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on action button, retry button, or dropdown menu
    if (
      (event.target as HTMLElement).closest(
        '[data-testid="streaming-action"]'
      ) ||
      (event.target as HTMLElement).closest('[data-testid="retry-button"]') ||
      (event.target as HTMLElement).closest('[data-testid="stream-menu"]')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onWatchClick();
  };

  return (
    <Card
      onClick={handleCardClick}
      className="media-card p-4 min-h-md min-w-md"
      data-testid="media-card"
    >
      <CardHeader className="space-y-4 px-3">
        {/* Title */}
        <div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-ellipsis">
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
        </div>
        {/* Stream Details */}
        <div className="text-xs text-muted-foreground flex justify-between items-center gap-2">
          <div>
            <span data-testid="streaming-date">
              {scheduledTime.toLocaleDateString()}
            </span>
            <span data-testid="streaming-time">
              {scheduledTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span data-testid="streaming-participants">
            {participantCount} joined
          </span>
        </div>

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
      </CardHeader>

      {/* Streaming Actions */}
      <CardFooter className="flex mt-4 justify-between">
        <div className="flex flex-col gap-2">
          {error ? (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-red-500">{error}</span>
              <Button
                variant="outline"
                size="sm"
                data-testid="retry-button"
                onClick={handleRetry}
                disabled={isLoading}
              >
                Try Again
              </Button>
            </div>
          ) : reminderError ? (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-red-500">{reminderError}</span>
            </div>
          ) : (
            <Button
              variant={"primary"}
              size={"lg"}
              data-testid="streaming-action"
              disabled={isParticipant || isLoading}
              onClick={handleJoinClick}
            >
              {isLoading
                ? "Joining..."
                : isParticipant
                ? "Joined"
                : "Join Stream"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                data-testid="stream-menu-trigger"
                aria-haspopup="menu"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" data-testid="stream-menu">
              {!isParticipant ? (
                <DropdownMenuItem
                  onClick={handleMenuJoin}
                  disabled={isLoading}
                  data-testid="menu-join"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Joining..." : "Join Stream"}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={handleMenuLeave}
                    disabled={isLoading}
                    data-testid="menu-leave"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    {isLoading ? "Leaving..." : "Leave Stream"}
                  </DropdownMenuItem>
                  {onToggleReminder && (
                    <DropdownMenuItem
                      onClick={handleMenuToggleReminder}
                      disabled={isReminderLoading}
                      data-testid="menu-reminder"
                    >
                      {reminderEnabled ? (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          {isReminderLoading
                            ? "Updating..."
                            : "Disable Reminder"}
                        </>
                      ) : (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          {isReminderLoading
                            ? "Updating..."
                            : "Enable Reminder"}
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor} flex-shrink-0`}
            data-testid="streaming-status"
          >
            {status.text}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
