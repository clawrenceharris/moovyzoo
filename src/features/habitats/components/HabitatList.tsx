"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  HabitatCard,
  LoadingState,
  ErrorState,
  EmptyState,
} from "@/components";
import type { HabitatWithMembership } from "../domain/habitats.types";

interface HabitatWithActivity extends HabitatWithMembership {
  recent_activity?: {
    discussions_count?: number;
    active_watch_parties?: number;
    recent_messages?: number;
    last_activity_at?: string;
  };
}

interface HabitatListProps {
  habitats: HabitatWithActivity[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function HabitatList({
  habitats,
  loading = false,
  error,
  onRetry,
}: HabitatListProps) {
  const router = useRouter();

  const handleHabitatClick = (habitatId: string) => {
    router.push(`/habitats/${habitatId}`);
  };

  // Loading state
  if (loading) {
    return <LoadingState variant="grid" count={6} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load habitats"
        message={error}
        onRetry={onRetry}
        retryLabel="Try again"
      />
    );
  }

  // Empty state
  if (habitats.length === 0) {
    return (
      <EmptyState
        title="No habitats yet"
        description="You haven't joined any habitats yet. Discover communities around your favorite movies and shows."
        actionLabel="Refresh"
        onAction={onRetry}
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
    );
  }

  // Habitats list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {habitats.map((habitat) => (
        <HabitatCard
          key={habitat.id}
          habitat={habitat}
          onClick={handleHabitatClick}
          memberCount={habitat.recent_activity?.discussions_count}
        />
      ))}
    </div>
  );
}
