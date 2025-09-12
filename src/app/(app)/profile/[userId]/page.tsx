import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import type { ProfileWithFriendStatus } from "@/features/profile/domain/profiles.types";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export const metadata: Metadata = {
  title: "User Profile | Zoovie",
  description: "View user profile on Zoovie",
};

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  
  try {
    const supabase = await createClient();
    
    // Get current user to check if viewing own profile
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return (
        <ProfilePage 
          profile={null} 
          error="Please log in to view profiles"
          isOwnProfile={false}
        />
      );
    }

    const isOwnProfile = currentUser.id === userId;

    // If viewing own profile, use the simple profile endpoint
    if (isOwnProfile) {
      // For own profile, we can use the existing server repository
      const { profilesServerRepository } = await import("@/features/profile/data/profiles.server");
      const profile = await profilesServerRepository.getProfileByUserId(userId);
      
      if (!profile) {
        return (
          <ProfilePage 
            profile={null} 
            error="Profile not found"
            isOwnProfile={true}
          />
        );
      }

      return (
        <ProfilePage 
          profile={profile} 
          isOwnProfile={true}
        />
      );
    }

    // For other users' profiles, use the server repository that includes friend status
    const { profilesServerRepository } = await import("@/features/profile/data/profiles.server");
    const profile = await profilesServerRepository.getProfileWithFriendStatus(userId, currentUser.id);

    return (
      <ProfilePage 
        profile={profile} 
        isOwnProfile={false}
      />
    );
  } catch (error) {
    console.error("Error loading user profile:", error);
    return (
      <ProfilePage 
        profile={null} 
        error="Failed to load profile"
        isOwnProfile={false}
      />
    );
  }
}