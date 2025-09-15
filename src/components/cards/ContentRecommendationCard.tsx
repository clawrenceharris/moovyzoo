"use client";
import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui";
import type { ContentRecommendation } from "@/features/ai-recommendations/types/recommendations";

/**
 * Props for the ContentRecommendationCard component
 */
export interface ContentRecommendationCardProps {
  /** The content recommendation data to display */
  recommendation: ContentRecommendation;
  /** Callback when the card is clicked - now opens modal instead of navigation */
  onCardClick?: (recommendation: ContentRecommendation) => void;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * ContentRecommendationCard component displays AI-generated content recommendations.
 *
 * This component renders content recommendation details including poster image, title,
 * match score, explanation, and media type badge. It follows the existing card patterns
 * with cinematic styling and hover effects.
 *
 * @example
 * ```tsx
 * <ContentRecommendationCard
 *   recommendation={contentRecommendation}
 *   onCardClick={(recommendation) => openContentModal(recommendation)}
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable content recommendation card with cinematic styling
 */
export function ContentRecommendationCard({
  recommendation,
  onCardClick,
  className,
}: ContentRecommendationCardProps) {
  const handleClick = () => {
    onCardClick?.(recommendation);
  };

  const getMediaTypeLabel = () => {
    return recommendation.media_type === 'movie' ? 'Movie' : 'TV Show';
  };

  return (
    <Card
      className="media-card"
      onClick={handleClick}
      data-testid="media-card"
    >
      <CardHeader className="p-0">
        {/* Poster Image */}
        <div className="content-recommendation-banner">
          {recommendation.poster_url ? (
            <Image
              src={recommendation.poster_url}
              alt={`${recommendation.title} poster`}
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
              recommendation.poster_url ? "hidden" : ""
            }`}
            data-testid="content-poster-fallback"
          >
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

          {/* Media Type Badge */}
          <div className="media-card-tags">
            <span className="media-card-tag">
              {getMediaTypeLabel()}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3">
        {/* Title */}
        <div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
            {recommendation.title}
          </h4>
        </div>

        {/* Match Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-accent">
            {recommendation.match_score}% Match
          </span>
        </div>

        {/* Explanation */}
        <div className="text-xs text-muted-foreground">
          <p className="line-clamp-2">
            {recommendation.short_explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}