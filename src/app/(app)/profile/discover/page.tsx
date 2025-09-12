import { ProfileDiscovery } from "@/features/profile/components/ProfileDiscovery";
import { EmptyState } from "@/components/states";
import { createClient } from "@/utils/supabase/server";
import { profilesServerRepository } from "@/features/profile/data/profiles.server";
import type { Metadata } from "next";
import { ProfileWithFriendStatus } from "@/features/profile/domain/profiles.types";

export const metadata: Metadata = {
  title: "Discover Profiles | Zoovie",
  description: "Discover and connect with other Zoovie users",
};

export default async function ProfileDiscoverPage() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <EmptyState
            title="Authentication Required"
            description="Please sign in to discover and connect with other users."
            variant="card"
          />
        </div>
      );
    }

    // Fetch initial profiles directly from the server repository
    let initialProfiles: ProfileWithFriendStatus[] | undefined = [];
    let initialPagination = { limit: 20, offset: 0, hasMore: false };

    try {
      const profiles = await profilesServerRepository.getPublicProfilesWithFriendStatus(
        user.id,
        20,
        0
      );
      
      initialProfiles = profiles;
      initialPagination = {
        limit: 20,
        offset: 0,
        hasMore: profiles.length === 20, // If we got full limit, there might be more
      };
    } catch (error) {
      console.error("Error fetching initial profiles:", error);
      // Continue with empty profiles - the client component will handle loading
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <ProfileDiscovery 
          initialProfiles={initialProfiles}
          initialPagination={initialPagination}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading profiles:", error);
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EmptyState
          title="Unable to Load Profiles"
          description="There was an error loading the profile discovery page."
          variant="card"
        />
      </div>
    );
  }
}