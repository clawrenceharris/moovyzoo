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
import { useJoinStream, useLeaveStream } from "@/features/streaming";

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

  const [isReminderLoading, setIsReminderLoading] = useState(false);

  const scheduledTime = new Date(stream.scheduled_time);
  const now = new Date();
  const isUpcoming = scheduledTime > now;

  const { mutate: joinStream, isPending: isJoining } = useJoinStream();
  const { mutate: leaveStream, isPending: isLeaving } = useLeaveStream();

  const isLoading = isJoining || isLeaving;

  const handleJoinStream = () => {
    joinStream({ streamId: stream.id, userId });
    onJoinClick();
  };

  const handleLeaveClick = () => {
    leaveStream({ streamId: stream.id, userId });
    onLeaveClick();
  };

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
    return stream.participants
      .map((participant) => participant.user_id)
      .includes(userId);
  }, [stream.participants, userId]);

  const userParticipant = useMemo(() => {
    return stream.participants.find((p) => p.user_id === userId);
  }, [stream.participants, userId]);

  const status = getStatus();

  const getPosterUrl = () => {
    if (!stream.poster_path) return "";
    return getImageUrl(stream.poster_path);
  };

  const getReleaseYear = () => {
    if (!stream.release_date) return "";
    return new Date(stream.release_date).getFullYear().toString();
  };

  // Enhanced reminder toggle functionality with loading states and error handling
  const handleToggleReminder = useCallback(async () => {
    if (!onToggleReminder || isReminderLoading) return;

    setIsReminderLoading(true);

    const newReminderState = !userParticipant?.reminder_enabled;

    // Optimistic update

    try {
      await onToggleReminder(stream.id, newReminderState);
      // Success - optimistic state will be replaced by real data
    } catch {
    } finally {
      setIsReminderLoading(false);
    }
  }, [
    onToggleReminder,
    isReminderLoading,
    userParticipant?.reminder_enabled,
    stream.id,
  ]);

  const handleMenuToggleReminder = useCallback(() => {
    handleToggleReminder();
  }, [handleToggleReminder]);

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on action button, retry button, or dropdown menu
    if (
      (event.target as HTMLElement).closest('[data-testid="stream-action"]') ||
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
      className="media-card w-full"
      data-testid="media-card"
    >
      <CardHeader className="space-y-3 p-3">
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
            className={`w-full h-full bg-muted rounded-md flex items-center justify-center ${
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

        {/* Title */}
        <div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
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
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <div className="flex flex-col sm:flex-row sm:gap-2">
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
            <span
              data-testid="streaming-participants"
              className="flex-shrink-0"
            >
              {stream.participants.length} joined
            </span>
          </div>
        </div>
      </CardHeader>

      {/* Streaming Actions */}
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-between p-3">
        <div className="flex flex-col gap-2 flex-1">
          {
            <Button
              variant={"primary"}
              size={"default"}
              data-testid="stream-action"
              disabled={isParticipant || isLoading}
              onClick={handleJoinStream}
              className="w-full sm:w-auto"
            >
              {isLoading
                ? "Joining..."
                : isParticipant
                ? "Joined"
                : "Join Stream"}
            </Button>
          }
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor} flex-shrink-0`}
            data-testid="streaming-status"
          >
            {status.text}
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
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
                  onClick={onJoinClick}
                  disabled={isLoading}
                  data-testid="menu-join"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isLoading ? "Joining..." : "Join Stream"}
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={handleLeaveClick}
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
                      {userParticipant?.reminder_enabled ? (
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
        </div>
      </CardFooter>
    </Card>
  );
}
