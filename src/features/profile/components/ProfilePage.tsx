"use client";

import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { FavoriteTitles } from "./FavoriteTitles";
import { RecentActivity } from "./RecentActivity";
import { LoadingState } from "@/components/states";
import { ErrorState } from "@/components/states";
import type { UserProfile } from "../domain/profiles.types";

interface ProfilePageProps {
  profile: UserProfile | null;
  isLoading?: boolean;
  error?: string;
  isOwnProfile?: boolean;
}

export function ProfilePage({ profile, isLoading, error, isOwnProfile = false }: ProfilePageProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Stats Section */}
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {isOwnProfile ? "Your Stats" : "Stats"}
        </h2>
        <ProfileStats
          badgesEarned={mockStats.badgesEarned}
          bingeRacesWon={mockStats.bingeRacesWon}
          habitatsJoined={mockStats.habitatsJoined}
        />
      </section>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Favorite Titles */}
          <FavoriteTitles titles={profile.favoriteTitles} />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* Edit Profile Modal - TODO: Implement */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <p className="text-muted-foreground mb-4">Profile editing coming soon...</p>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}