"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HabitatList,
  HabitatCreationModal,
} from "@/features/habitats/components";
import { useUserHabitats } from "@/features/habitats/hooks";
import { useUser } from "@/hooks/useUser";

export default function HabitatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { habitats, loading, error, refresh } = useUserHabitats(user?.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = (habitatId: string) => {
    // Refresh the habitats list
    refresh();
    // Navigate to the new habitat
    router.push(`/habitats/${habitatId}`);
  };

  // Show loading state while user is being fetched
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div
            className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"
            aria-label="Loading page title"
          ></div>
          <div
            className="h-4 bg-muted rounded w-96 animate-pulse"
            aria-label="Loading page description"
          ></div>
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Loading habitats"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 bg-muted rounded animate-pulse"
              aria-label={`Loading habitat ${index + 1}`}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col mx-auto px-4 py-8 min-h-screen">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Habitats
            </h1>
            <p className="text-muted-foreground">
              Connect with communities around your favorite movies and shows
            </p>
          </div>
        </div>
      </header>

      <main className="section flex-1">
        <HabitatList
          habitats={habitats}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </main>

      <HabitatCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.id}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
