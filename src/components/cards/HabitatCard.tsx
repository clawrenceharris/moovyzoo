import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HabitatWithMembership } from "@/features/habitats/domain/habitats.types";

/**
 * Extended habitat type with activity metrics
 */
interface HabitatWithActivity extends HabitatWithMembership {
  recent_activity?: {
    discussions_count?: number;
    active_watch_parties?: number;
    recent_messages?: number;
    last_activity_at?: string;
  };
}

/**
 * Props for the HabitatCard component
 */
export interface HabitatCardProps {
  /** The habitat data to display */
  habitat: HabitatWithActivity;
  /** Callback when the card is clicked, receives the habitat ID */
  onClick: (habitatId: string) => void;
  /** Override the displayed member count */
  memberCount?: number;
  /** Text for the action button */
  buttonLabel?: string;
  /** Style variant for the action button */
  buttonVariant?: "default" | "secondary" | "tertiary" | "outline" | "ghost";
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * HabitatCard component displays habitat information in a cinematic card layout.
 *
 * This component renders habitat details including banner image, name, description,
 * tags, member count, and an action button. It features hover effects and follows
 * the cinematic design system with gradient fallbacks for missing images.
 *
 * @example
 * ```tsx
 * // Basic habitat card
 * <HabitatCard
 *   habitat={habitatData}
 *   onClick={(id) => router.push(`/habitats/${id}`)}
 * />
 *
 * // Custom button and member count
 * <HabitatCard
 *   habitat={habitatData}
 *   onClick={handleClick}
 *   memberCount={42}
 *   buttonLabel="Join Now"
 *   buttonVariant="default"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable habitat card with cinematic styling
 */
export function HabitatCard({
  habitat,
  onClick,
  memberCount,
  buttonLabel = "View Habitat",
  buttonVariant = "tertiary",
  className,
}: HabitatCardProps) {
  const handleClick = () => {
    onClick(habitat.id);
  };

  // Calculate member count from recent activity or use provided value or default
  const displayMemberCount =
    memberCount || habitat.recent_activity?.discussions_count || 24;

  return (
    <div
      className={`habitat-card ${className || ""}`}
      onClick={handleClick}
      data-testid="habitat-card"
    >
      {/* Banner Image */}
      <div className="habitat-card-banner">
        {habitat.banner_url ? (
          <Image
            src={habitat.banner_url}
            alt={`${habitat.name} banner`}
            fill
            className="object-cover"
          />
        ) : (
          // Fallback gradient background
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30" />
        )}
      </div>

      {/* Tags - positioned absolutely in top right */}
      {habitat.tags && habitat.tags.length > 0 && (
        <div className="habitat-card-tags">
          {habitat.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="habitat-card-tag">
              {tag}
            </span>
          ))}
          {habitat.tags.length > 2 && (
            <span className="habitat-card-tag">+{habitat.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Content Overlay */}
      <div className="flex justify-between p-6 items-center">
        <h3>{habitat.name}</h3>

        <div className="habitat-card-members">
          <svg
            className="habitat-card-members-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          {displayMemberCount} online
        </div>
      </div>
      <div className="card-content">
        {habitat.description && (
          <p className="card-description">{habitat.description}</p>
        )}
      </div>
    </div>
  );
}
