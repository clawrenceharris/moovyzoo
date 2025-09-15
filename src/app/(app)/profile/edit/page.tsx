import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import { ProfileEditForm } from "@/features/profile/components";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile | MoovyZoo",
  description: "Edit your MoovyZoo profile information and preferences",
};

export default async function ProfileEditPage() {
  try {
    const profile = await profilesServerRepository.getCurrentUserProfile();
    
    if (!profile) {
      redirect("/auth/login");
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information and preferences</p>
        </div>
        
        <ProfileEditForm profile={profile} />
      </div>
    );
  } catch (error) {
    console.error("Error loading profile for editing:", error);
    redirect("/profile");
  }
}