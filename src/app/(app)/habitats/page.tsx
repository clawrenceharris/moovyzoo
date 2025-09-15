"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  HabitatList,
  HabitatCreationModal,
} from "@/features/habitats/components";
import { HabitatCard } from "@/components/cards/HabitatCard";
import { Button } from "@/components/ui";
import { useUser } from "@/hooks/use-user";
import { 
  useUserHabitats, 
  usePublicHabitats, 
  usePopularHabitats 
} from "@/hooks/queries/use-habitat-queries";
import { 
  useJoinHabitat, 
  useLeaveHabitat 
} from "@/hooks/mutations/use-habitat-mutations";
import { EmptyState, ErrorState, LoadingState } from "@/components";
import { getErrorMessage } from "@/utils/error-map";
import { getUserErrorMessage } from "@/utils/normalize-error";
import { AppErrorCode } from "@/utils/error-codes";

export default function HabitatsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const {
    data: userHabitats,
    isLoading: isLoadingUserHabitats,
    error: userHabitatsError,
    refetch: refetchUserHabitats,
  } = useUserHabitats(user?.id);

  const {
    data: publicHabitats,
    isLoading: isLoadingPublicHabitats,
    error: publicHabitatsError,
    refetch: refetchPublicHabitats,
  } = usePublicHabitats(user?.id, 12);

  const {
    data: popularHabitats,
    isLoading: isLoadingPopularHabitats,
    error: popularHabitatsError,
    refetch: refetchPopularHabitats,
  } = usePopularHabitats(user?.id, 8);

  // Mutations
  const joinHabitatMutation = useJoinHabitat({
    onSuccess: () => {
      refetchUserHabitats();
      refetchPublicHabitats();
      refetchPopularHabitats();
    },
  });

  const leaveHabitatMutation = useLeaveHabitat({
    onSuccess: () => {
      refetchUserHabitats();
      refetchPublicHabitats();
      refetchPopularHabitats();
    },
  });

  const handleCreateSuccess = (habitatId: string) => {
    // Refresh all habitat lists
    refetchUserHabitats();
    refetchPublicHabitats();
    refetchPopularHabitats();
    // Navigate to the new habitat
    router.push(`/habitats/${habitatId}`);
  };

  const handleHabitatClick = (habitatId: string) => {
    router.push(`/habitats/${habitatId}`);
  };

  const handleJoinHabitat = (habitatId: string) => {
    if (!user?.id) return;
    joinHabitatMutation.mutate({ habitatId, userId: user.id });
  };

  const handleLeaveHabitat = (habitatId: string) => {
    if (!user?.id) return;
    leaveHabitatMutation.mutate({ habitatId, userId: user.id });
  };

  // Show loading state while user is being fetched
  if (!user) {
    return <LoadingState variant="page" />;
  }

  // Show error if there's a user habitats error
  if (userHabitatsError) {
    return (
      <ErrorState
        message={getUserErrorMessage(userHabitatsError.message)}
        onRetry={refetchUserHabitats}
      />
    );
  }
  return (
    <div className="container flex flex-col mx-auto px-4 py-8 min-h-screen space-y-8">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Discover Habitats
            </h1>
            <p className="text-muted-foreground">
              Connect with communities around your favorite movies and shows
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="ml-4"
            variant="primary"
          >
            Create Habitat
          </Button>
        </div>
      </header>

      {/* User's Habitats Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Your Habitats
          </h2>
          {userHabitats && userHabitats.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {userHabitats.length} habitat{userHabitats.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {isLoadingUserHabitats ? (
          <LoadingState variant="grid" count={6} />
        ) : userHabitats && userHabitats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {userHabitats.map((habitat) => (
              <HabitatCard
                key={habitat.id}
                habitat={habitat}
                onClick={handleHabitatClick}
                showActionButton={true}
                onLeave={handleLeaveHabitat}
                isActionLoading={
                  leaveHabitatMutation.isPending && 
                  leaveHabitatMutation.variables?.habitatId === habitat.id
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No habitats yet"
            description="You haven't joined any habitats yet. Discover communities below!"
            actionLabel="Create Your First Habitat"
            onAction={() => setIsCreateModalOpen(true)}
            icon={
              <svg
                className="w-12 h-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            }
          />
        )}
      </section>

      {/* Popular Habitats Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Popular Habitats
          </h2>
        </div>

        {isLoadingPopularHabitats ? (
          <LoadingState variant="grid" count={4} />
        ) : popularHabitatsError ? (
          <ErrorState
            message="Failed to load popular habitats"
            onRetry={refetchPopularHabitats}
            variant="minimal"
          />
        ) : popularHabitats && popularHabitats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {popularHabitats.map((habitat) => (
              <HabitatCard
                key={habitat.id}
                habitat={habitat}
                onClick={handleHabitatClick}
                showActionButton={true}
                onJoin={!habitat.is_member ? handleJoinHabitat : undefined}
                onLeave={habitat.is_member ? handleLeaveHabitat : undefined}
                isActionLoading={
                  (joinHabitatMutation.isPending && 
                   joinHabitatMutation.variables?.habitatId === habitat.id) ||
                  (leaveHabitatMutation.isPending && 
                   leaveHabitatMutation.variables?.habitatId === habitat.id)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No popular habitats"
            description="Check back later for trending communities."
            variant="minimal"
          />
        )}
      </section>


      <HabitatCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={user.id}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
