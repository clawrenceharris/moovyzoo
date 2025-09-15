"use client";
import { useRouter } from "next/navigation";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUser } from "@/hooks/use-user";
import { useRecommendations } from "@/features/ai-recommendations/hooks/use-recommendations";
import { useFriendActions } from "@/features/profile/hooks/use-friend-actions";
import { MockWatchHistoryDemo } from "@/features/profile/components/MockWatchHistoryDemo";
import { RecommendationsSection } from "@/components/cards/RecommendationsSection";

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const { profile } = useProfile(user?.id);
  const { recommendations, isLoading, error, refreshRecommendations } = useRecommendations(user?.id);

  // Navigation handlers
  const handleContentClick = (tmdbId: number, mediaType: 'movie' | 'tv') => {
    router.push(`/content/${mediaType}/${tmdbId}`);
  };

  const handleFriendClick = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const handleSendFriendRequest = async (userId: string) => {
    // Send friend request via API directly
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send friend request:', errorData.error);
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          <span className="text-foreground/80">Welcome, </span>
          <span className="text-primary drop-shadow-[0_2px_10px_rgba(229,9,20,0.35)]">
            {profile?.displayName || "User"}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">What would you like to watch or explore today?</p>
      </div>

      {/* AI Recommendations Section */}
      <RecommendationsSection
        contentRecommendations={recommendations?.content_recommendations || []}
        friendSuggestions={recommendations?.friend_suggestions || []}
        isLoading={isLoading}
        error={error || undefined}
        onRefreshRecommendations={refreshRecommendations}
        onContentClick={handleContentClick}
        onFriendClick={handleFriendClick}
        onSendFriendRequest={handleSendFriendRequest}
        currentUserId={user?.id}
      />

      {/* Mock Watch History Tracker Demo */}
      <MockWatchHistoryDemo />
    </div>
  );
}
