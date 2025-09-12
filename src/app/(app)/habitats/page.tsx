"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HabitatList,
  HabitatCreationModal,
} from "@/features/habitats/components";
import { useUser } from "@/hooks/use-user";
import { useUserHabitats } from "@/hooks/queries/use-habitat-queries";
import { EmptyState, ErrorState } from "@/components";
import { getErrorMessage } from "@/utils/error-map";
import { getUserErrorMessage } from "@/utils/normalize-error";
import { AppErrorCode } from "@/utils/error-codes";

export default function HabitatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: habitats,
    isLoading,
    error,
    refetch,
  } = useUserHabitats(user?.id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateSuccess = (habitatId: string) => {
    // Refresh the habitats list
    refetch();
    // Navigate to the new habitat
    router.push(`/habitats/${habitatId}`);
  };

  // Show loading state while user is being fetched
  if (error) {
    return (
      <ErrorState
        message={getUserErrorMessage(error.message)}
        onRetry={refetch}
      />
    );
  }
  if (!habitats?.length) {
    return (
      <EmptyState
        description="Doesn't look like you are a part of any Habitats."
        onAction={refetch}
      />
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
          loading={isLoading}
          onRetry={refetch}
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
