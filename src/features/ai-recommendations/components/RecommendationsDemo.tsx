"use client";
import React from "react";
import { RecommendationsSection } from "@/components/cards";
import { useRecommendations } from "../hooks";
import { useRouter } from "next/navigation";

/**
 * Props for the RecommendationsDemo component
 */
export interface RecommendationsDemoProps {
    /** Current user's ID */
    userId: string;
    /** Additional CSS classes to apply */
    className?: string;
}

/**
 * RecommendationsDemo component demonstrates the complete AI recommendations integration.
 *
 * This component shows how to use the useRecommendations hook with the RecommendationsSection
 * component to create a complete recommendations experience. It handles navigation and
 * friend request functionality.
 *
 * @example
 * ```tsx
 * <RecommendationsDemo userId="current-user-id" />
 * ```
 *
 * @param props - The component props
 * @returns A complete recommendations demo with navigation and interactions
 */
export function RecommendationsDemo({
    userId,
    className,
}: RecommendationsDemoProps) {
    const router = useRouter();
    const { recommendations, isLoading, error, refreshRecommendations } = useRecommendations(userId);

    const handleContentClick = (tmdbId: number, mediaType: 'movie' | 'tv') => {
        // Navigate to content details page
        router.push(`/content/${mediaType}/${tmdbId}`);
    };

    const handleFriendClick = (friendUserId: string) => {
        // Navigate to friend's profile page
        router.push(`/profile/${friendUserId}`);
    };

    const handleSendFriendRequest = async (friendUserId: string) => {
        try {
            const response = await fetch('/api/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ receiverId: friendUserId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send friend request');
            }

            // Optionally show success message or update UI
            console.log('Friend request sent successfully');
        } catch (err) {
            console.error('Failed to send friend request:', err);
            // Optionally show error message to user
        }
    };

    return (
        <div className={className}>
            <RecommendationsSection
                contentRecommendations={recommendations?.content_recommendations || []}
                friendSuggestions={recommendations?.friend_suggestions || []}
                isLoading={isLoading}
                error={error || undefined}
                onRefreshRecommendations={refreshRecommendations}
                onContentClick={handleContentClick}
                onFriendClick={handleFriendClick}
                onSendFriendRequest={handleSendFriendRequest}
                currentUserId={userId}
            />
        </div>
    );
}