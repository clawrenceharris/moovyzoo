import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import type { HabitatWithMembership } from "@/features/habitats/domain/habitats.types";
import { Card, CardContent, CardDescription } from "../";

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
    <Card
      className={"media-card"}
      onClick={handleClick}
      data-testid="media-card"
    >
      {/* Banner Image */}
      <div className="media-card-banner">
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
        {habitat.tags && habitat.tags.length > 0 && (
          <div className="media-card-tags">
            {habitat.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="media-card-tag">
                {tag}
              </span>
            ))}
            {habitat.tags.length > 2 && (
              <span className="media-card-tag">+{habitat.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>
      <CardContent className="space-y-4">
        {/* Content Overlay */}
        <div className="flex justify-between items-center">
          <h3>{habitat.name}</h3>
        </div>
        {/* Tags */}

        <CardDescription>
          {habitat.description && (
            <p className="card-description">{habitat.description}</p>
          )}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
