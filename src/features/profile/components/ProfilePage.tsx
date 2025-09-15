"use client";

import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { FavoriteTitles } from "./FavoriteTitles";
import { WatchHistory } from "./WatchHistory";
import { LoadingState } from "@/components/states";
import { ErrorState } from "@/components/states";
import type { UserProfile, ProfileWithFriendStatus, FriendStatus } from "../domain/profiles.types";
import { useRecentWatchActivity } from "../hooks/use-watch-history";

interface ProfilePageProps {
  profile: ProfileWithFriendStatus | UserProfile | null;
  isLoading?: boolean;
  error?: string;
  isOwnProfile?: boolean;
}

export function ProfilePage({ profile, isLoading, error, isOwnProfile = false }: ProfilePageProps) {
  const [friendStatus, setFriendStatus] = useState<FriendStatus | undefined>(
    profile && 'friendStatus' in profile ? profile.friendStatus : undefined
  );

  // Check if profile has friend status (ProfileWithFriendStatus)
  const profileWithFriendStatus = profile && 'friendStatus' in profile ? profile as ProfileWithFriendStatus : null;
  const watchHistory = profileWithFriendStatus?.recentWatchHistory;

  // Also fetch recent watch activity for the profile user (helps show own history)
  const { data: recentActivity = [] } = useRecentWatchActivity(profile?.userId, 5);
  const renderWatchHistory = (watchHistory && watchHistory.length > 0)
    ? watchHistory
    : (recentActivity && recentActivity.length > 0 ? recentActivity : undefined);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <LoadingState variant="card" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ErrorState
          message={error || "Profile not found"}
          variant="card"
        />
      </div>
    );
  }

  // Mock stats for demonstration
  const mockStats = {
    badgesEarned: 2,
    bingeRacesWon: 3,
    habitatsJoined: 5,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        friendStatus={friendStatus}
        onFriendStatusChange={setFriendStatus}
      />

      {/* Stats Section */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {isOwnProfile ? "Your Stats" : "Stats"}
        </h2>
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Favorite Titles */}
          <FavoriteTitles titles={profile.favoriteTitles} />

          {/* Watch History - show server-provided if present, else fall back to recent activity */}
          {renderWatchHistory && (
            <WatchHistory 
              watchHistory={renderWatchHistory}
              isOwnProfile={isOwnProfile}
            />
          )}
        </div>
      </div>


    </div>
  );
}