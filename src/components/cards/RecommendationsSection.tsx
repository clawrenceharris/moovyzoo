"use client";
import React from "react";
import { Button } from "@/components/ui";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { ContentRecommendationCard } from "./ContentRecommendationCard";
import { FriendSuggestionCard } from "./FriendSuggestionCard";
import { RecommendationErrorBoundary } from "@/features/ai-recommendations/components/RecommendationErrorBoundary";
import { RefreshCw, Sparkles, Users } from "lucide-react";
import type { ContentRecommendation, FriendSuggestion } from "@/features/ai-recommendations/types/recommendations";

/**
 * Props for the RecommendationsSection component
 */
export interface RecommendationsSectionProps {
  /** Array of content recommendations to display */
  contentRecommendations: ContentRecommendation[];
  /** Array of friend suggestions to display */
  friendSuggestions: FriendSuggestion[];
  /** Whether recommendations are currently loading */
  isLoading: boolean;
  /** Error message if recommendations failed to load */
  error?: string;
  /** Callback to refresh recommendations */
  onRefreshRecommendations: () => void;
  /** Callback when a content recommendation is clicked */
  onContentClick: (tmdbId: number, mediaType: 'movie' | 'tv') => void;
  /** Callback when a friend suggestion profile is clicked */
  onFriendClick: (userId: string) => void;
  /** Callback when a friend request is sent */
  onSendFriendRequest?: (userId: string) => void;
  /** Current user's ID for friend request functionality */
  currentUserId?: string;
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * RecommendationsSection component displays AI-generated recommendations.
 *
 * This component renders both content recommendations and friend suggestions
 * with appropriate loading, error, and empty states. It provides a refresh
 * mechanism and handles user interactions with recommendations.
 *
 * @example
 * ```tsx
 * <RecommendationsSection
 *   contentRecommendations={contentRecs}
 *   friendSuggestions={friendSugs}
 *   isLoading={false}
 *   onRefreshRecommendations={handleRefresh}
 *   onContentClick={handleContentClick}
 *   onFriendClick={handleFriendClick}
 *   onSendFriendRequest={handleSendFriendRequest}
 *   currentUserId="current-user-id"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A recommendations section with content and friend suggestions
 */
export function RecommendationsSection({
  contentRecommendations,
  friendSuggestions,
  isLoading,
  error,
  onRefreshRecommendations,
  onContentClick,
  onFriendClick,
  onSendFriendRequest,
  currentUserId,
  className,
}: RecommendationsSectionProps) {
  const hasContent = contentRecommendations.length > 0;
  const hasFriends = friendSuggestions.length > 0;
  const hasAnyRecommendations = hasContent || hasFriends;

  // Handle friend request with fallback
  const handleSendFriendRequest = (userId: string) => {
    if (onSendFriendRequest) {
      onSendFriendRequest(userId);
    }
  };

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <div className={className}>
        <ErrorState
          variant="card"
          title="Unable to load recommendations"
          message={error}
          onRetry={onRefreshRecommendations}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  // Show empty state if no recommendations and not loading
  if (!hasAnyRecommendations && !isLoading) {
    return (
      <div className={className}>
        <EmptyState
          variant="card"
          title="No recommendations yet"
          description="We're learning your preferences. Check back soon for personalized suggestions!"
          actionLabel="Get Recommendations"
          onAction={onRefreshRecommendations}
          icon={
            <Sparkles className="w-12 h-12 text-muted-foreground" />
          }
        />
      </div>
    );
  }

  return (
    <RecommendationErrorBoundary onRetry={onRefreshRecommendations}>
      <div className={`space-y-8 ${className || ""}`}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              AI Recommendations
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized suggestions just for you
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshRecommendations}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            New Recommendations
          </Button>
        </div>

        {/* Content Recommendations Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Recommended for You
            </h3>
          </div>

          {isLoading ? (
            <LoadingState variant="grid" count={4} />
          ) : hasContent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {contentRecommendations.map((recommendation) => (
                <ContentRecommendationCard
                  key={recommendation.tmdb_id}
                  recommendation={recommendation}
                  onCardClick={onContentClick}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="inline"
              title="No content recommendations available"
              description="Add some movies or shows to your watch history to get personalized suggestions."
            />
          )}
        </div>

        {/* Friend Suggestions Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              People You Might Like
            </h3>
          </div>

          {isLoading ? (
            <LoadingState variant="grid" count={4} />
          ) : hasFriends ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friendSuggestions.map((suggestion) => (
                <FriendSuggestionCard
                  key={suggestion.user_id}
                  suggestion={suggestion}
                  onProfileClick={onFriendClick}
                  onSendFriendRequest={handleSendFriendRequest}
                  currentUserId={currentUserId || ""}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant="inline"
              title="No friend suggestions available"
              description="Connect with more people to get friend recommendations based on similar tastes."
            />
          )}
        </div>
      </div>
    </RecommendationErrorBoundary>
  );
}