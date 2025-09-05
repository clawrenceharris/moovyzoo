import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

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
    
    // Get the profile for the requested user
    const profile = await profilesServerRepository.getProfileByUserId(userId);
    
    if (!profile) {
      return (
        <ProfilePage 
          profile={null} 
          error="Profile not found"
          isOwnProfile={false}
        />
      );
    }

    // Check if profile is public or if it's the user's own profile
    const isOwnProfile = currentUser?.id === userId;
    const canViewProfile = profile.isPublic || isOwnProfile;
    
    if (!canViewProfile) {
      return (
        <ProfilePage 
          profile={null} 
          error="This profile is private"
          isOwnProfile={false}
        />
      );
    }

    return (
      <ProfilePage 
        profile={profile} 
        isOwnProfile={isOwnProfile}
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