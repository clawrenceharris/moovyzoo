import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import { ProfilePage } from "@/features/profile/components/ProfilePage";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Zoovie",
  description: "View and manage your Zoovie profile",
};

export default async function ProfilePageRoute() {
  try {
    const profile = await profilesServerRepository.getCurrentUserProfile();
    
    if (!profile) {
      // Redirect to onboarding if no profile exists
      redirect("/auth/login");
    }

    return (
      <ProfilePage 
        profile={profile} 
        isOwnProfile={true}
      />
    );
  } catch (error) {
    console.error("Error loading profile:", error);
    return (
      <ProfilePage 
        profile={null} 
        error="Failed to load profile"
        isOwnProfile={true}
      />
    );
  }
}
