import React from "react";
import type { PollWithVotes } from "@/features/habitats/domain/habitats.types";

/**
 * Props for the PollCard component
 */
export interface PollCardProps {
  /** The poll data to display */
  poll: PollWithVotes;
  /** Callback when the card is clicked */
  onClick: () => void;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * PollCard component displays poll information with voting status and results.
 *
 * This component renders poll details including title, vote count, and user
 * participation status. It provides visual feedback for voting state and
 * encourages user interaction with dynamic action text.
 *
 * @example
 * ```tsx
 * // Basic poll card
 * <PollCard
 *   poll={pollData}
 *   onClick={() => router.push(`/polls/${pollData.id}`)}
 * />
 *
 * // With custom styling
 * <PollCard
 *   poll={pollData}
 *   onClick={handleVote}
 *   className="border-accent"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable poll card with vote count and participation status
 */
export function PollCard({ poll, onClick, className = "" }: PollCardProps) {
  const totalVotes = poll.total_votes;
  const hasVoted = !!poll.user_vote;

  return (
    <div
      onClick={onClick}
      className={`p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group ${className}`}
      data-testid="poll-card"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {poll.title}
        </h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {totalVotes}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          {hasVoted && " • You voted"}
        </span>
        <span className="text-accent">
          {hasVoted ? "View results →" : "Vote now →"}
        </span>
      </div>
    </div>
  );
}
