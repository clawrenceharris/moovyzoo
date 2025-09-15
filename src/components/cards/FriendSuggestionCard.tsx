"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, Button } from "@/components/ui";
import { UserPlus, Clock } from "lucide-react";
import type { FriendSuggestion } from "@/features/ai-recommendations/types/recommendations";

/**
 * Props for the FriendSuggestionCard component
 */
export interface FriendSuggestionCardProps {
  /** The friend suggestion data to display */
  suggestion: FriendSuggestion;
  /** Callback when the profile area is clicked, receives user_id */
  onProfileClick: (userId: string) => void;
  /** Callback when the friend request button is clicked, receives user_id (deprecated - handled internally) */
  onSendFriendRequest?: (userId: string) => Promise<void>;
  /** Current user's ID to prevent self-friend requests */
  currentUserId: string;
  /** Friend request status from parent component */
  friendRequestStatus?: 'pending' | 'sent';
  /** Additional CSS classes to apply */
  className?: string;
}

/**
 * FriendSuggestionCard component displays AI-generated friend suggestions.
 *
 * This component renders friend suggestion details including avatar, display name,
 * taste match score, rationale, and friend request functionality. It follows the
 * existing card patterns with cinematic styling and hover effects.
 *
 * @example
 * ```tsx
 * <FriendSuggestionCard
 *   suggestion={friendSuggestion}
 *   onProfileClick={(userId) => router.push(`/profile/${userId}`)}
 *   onSendFriendRequest={handleSendFriendRequest}
 *   currentUserId="current-user-id"
 * />
 * ```
 *
 * @param props - The component props
 * @returns A clickable friend suggestion card with friend request functionality
 */
export function FriendSuggestionCard({
  suggestion,
  onProfileClick,
  onSendFriendRequest, // deprecated - handled internally
  currentUserId,
  className,
}: FriendSuggestionCardProps) {
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on action button
    if ((event.target as HTMLElement).closest('[data-testid="friend-action-button"]')) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    console.log(`[FriendSuggestionCard] Profile click for ${suggestion.display_name} with user_id: ${suggestion.user_id}`);
    onProfileClick(suggestion.user_id);
  };

  const handleFriendRequest = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isRequestSent || isLoading) {
      return;
    }

    // Optimistically show "Request Sent" immediately
    setIsRequestSent(true);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: suggestion.user_id }),
      });

      if (!response.ok) {
        // If the request already exists (idempotency), keep optimistic state silently
        if (response.status === 409) {
          return; // keep optimistic state
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }

      // Success - keep the optimistic state
    } catch (error) {
      console.error('Failed to send friend request:', error);
      // Revert optimistic state on error (except for 409 conflicts)
      setIsRequestSent(false);
      // TODO: Add toast notification for error feedback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="media-card"
      onClick={handleProfileClick}
      data-testid="friend-profile-area"
    >
      <CardHeader className="p-0">
        {/* Avatar/Banner Area */}
        <div className="media-card-banner">
          {suggestion.avatar_url ? (
            <Image
              src={suggestion.avatar_url}
              alt={`${suggestion.display_name} avatar`}
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
              suggestion.avatar_url ? "hidden" : ""
            }`}
            data-testid="friend-avatar-fallback"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3">
        {/* Display Name */}
        <div>
          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 text-sm">
            {suggestion.display_name}
          </h4>
        </div>

        {/* Taste Match Score */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-accent">
            {suggestion.taste_match_score}% Match
          </span>
        </div>

        {/* Rationale */}
        <div className="text-xs text-muted-foreground">
          <p className="line-clamp-2">
            {suggestion.short_rationale}
          </p>
        </div>

        {/* Friend Request Button */}
        <div className="pt-2">
          {isRequestSent ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="w-full opacity-60"
              data-testid="friend-action-button"
            >
              <Clock className="w-3 h-3 mr-1" />
              Request Sent
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleFriendRequest}
              disabled={isLoading}
              className="w-full"
              data-testid="friend-action-button"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              {isLoading ? 'Sending...' : 'Add Friend'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}