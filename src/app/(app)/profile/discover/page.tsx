import { EmptyState } from "@/components/states";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Profiles | Zoovie",
  description: "Discover and connect with other Zoovie users",
};

export default async function ProfileDiscoverPage() {
  try {
    // This would normally fetch public profiles from the server
    // For now, we'll show a placeholder

    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Profiles</h1>
          <p className="text-muted-foreground">Connect with other movie and TV enthusiasts</p>
        </div>

        <EmptyState
          title="Profile Discovery Coming Soon"
          description="We're working on a way for you to discover and connect with other users who share your interests."
          variant="card"
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