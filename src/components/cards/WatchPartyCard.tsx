import React from "react";
import type { WatchPartyWithParticipants } from "@/features/habitats/domain/habitats.types";

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
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * WatchPartyCard component displays watch party information with status and scheduling.
 *
 * This component renders watch party details including title, scheduled time,
 * participant count, and real-time status (Live/Upcoming/Ended). It provides
 * dynamic status indicators and participation feedback.
 *
 * @example
 * ```tsx
 * // Basic watch party card
 * <WatchPartyCard
 *   watchParty={partyData}
 *   onClick={() => router.push(`/watch-parties/${partyData.id}`)}
 * />
 *
 * // Without description
 * <WatchPartyCard
 *   watchParty={partyData}
 *   onClick={handleJoin}
 *   showDescription={false}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable watch party card with status indicators and scheduling info
 */
export function WatchPartyCard({
  watchParty,
  onClick,
  showDescription = true,
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

  return (
    <div
      onClick={onClick}
      className={`p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group ${className}`}
      data-testid="watch-party-card"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {watchParty.title}
        </h4>
        <span
          className={`text-xs font-medium ${status.color}`}
          data-testid="watch-party-status"
        >
          {status.text}
        </span>
      </div>

      {showDescription && watchParty.description && (
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {watchParty.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
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
        <span className="text-accent" data-testid="watch-party-action">
          {watchParty.is_participant ? "Joined →" : "Join party →"}
        </span>
      </div>
    </div>
  );
}
