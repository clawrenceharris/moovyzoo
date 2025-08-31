import React from "react";
import { Users } from "lucide-react";
import type { DiscussionWithStats } from "@/features/habitats/domain/habitats.types";

/**
 * Props for the DiscussionCard component
 */
export interface DiscussionCardProps {
  /** The discussion data to display */
  discussion: DiscussionWithStats;
  /** Callback when the card is clicked */
  onClick: () => void;
  /** Whether to show the discussion description */
  showDescription?: boolean;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * DiscussionCard component displays discussion information in a compact card format.
 *
 * This component renders discussion details including name, message count, and
 * optional description. It features hover effects and is optimized for list
 * displays within habitat dashboards.
 *
 * @example
 * ```tsx
 * // Basic discussion card
 * <DiscussionCard
 *   discussion={discussionData}
 *   onClick={() => router.push(`/discussions/${discussionData.id}`)}
 * />
 *
 * // Without description
 * <DiscussionCard
 *   discussion={discussionData}
 *   onClick={handleClick}
 *   showDescription={false}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable discussion card with message count and hover effects
 */
export function DiscussionCard({
  discussion,
  onClick,
  showDescription = true,
  className = "",
}: DiscussionCardProps) {
  const timeAgo = discussion.last_message_at
    ? new Date(discussion.last_message_at).toLocaleDateString()
    : "No messages yet";

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-card rounded-lg hover:bg-card/80 hover:border-accent/30 cursor-pointer transition-all duration-200 group backdrop-blur-sm ${className}`}
      data-testid="discussion-card"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={13} />
          {discussion.message_count}
        </div>
      </div>

      <h4 className="font-semibold text-foreground transition-colors mb-2">
        {discussion.name}
      </h4>

      {showDescription && discussion.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {discussion.description}
        </p>
      )}
    </div>
  );
}
