"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HabitatHero } from "./HabitatHero";
import { PopularInHabitat } from "./PopularInHabitat";
import { WatchParties } from "./WatchParties";
import { HabitatInfo } from "./HabitatInfo";
import { LoadingState, ErrorState } from "@/components";
import { habitatsService } from "../domain/habitats.service";
import type { HabitatWithMembership } from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";

interface HabitatDashboardProps {
  habitatId: string;
  userId: string;
  className?: string;
}

interface HabitatDashboardState {
  habitat: HabitatWithMembership | null;
  loading: boolean;
  error: string | null;
}

export function HabitatDashboard({
  habitatId,
  userId,
  className = "",
}: HabitatDashboardProps) {
  const router = useRouter();
  const [state, setState] = useState<HabitatDashboardState>({
    habitat: null,
    loading: true,
    error: null,
  });

  // Fetch habitat data
  const fetchHabitat = useCallback(async () => {
    if (!habitatId || !userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const habitat = await habitatsService.getHabitatById(habitatId, userId);
      setState({
        habitat,
        loading: false,
        error: null,
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      setState({
        habitat: null,
        loading: false,
        error: normalizedError.message,
      });
    }
  }, [habitatId, userId]);

  // Load habitat on mount
  useEffect(() => {
    fetchHabitat();
  }, [fetchHabitat]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchHabitat();
  }, [fetchHabitat]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push("/habitats");
  }, [router]);

  // Show loading state
  if (state.loading) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        <LoadingState variant="grid" />
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        <ErrorState
          title="Unable to load habitat"
          message={state.error}
          onRetry={handleRetry}
          retryLabel="Try Again"
        />
      </div>
    );
  }

  // Show dashboard
  if (state.habitat) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        {/* Breadcrumb Navigation */}
        <div className="border-b border-border bg-card/30 px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push("/habitats")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Habitats
            </button>
            <svg
              className="w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="text-foreground font-medium">
              {state.habitat.name}
            </span>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-background">
          {/* Hero Section - Full Width */}
          <div className="px-6 pt-6">
            <HabitatHero
              habitat={state.habitat}
              onStartStreamingParty={() => {
                // TODO: Implement streaming party creation
                console.log("Start streaming party");
              }}
              onCreatePoll={() => {
                // TODO: Implement poll creation
                console.log("Create poll");
              }}
            />
          </div>

          {/* Dashboard Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Popular in Habitat Section */}
                <PopularInHabitat
                  discussions={[]} // TODO: Fetch from service
                  polls={[]} // TODO: Fetch from service
                  watchParties={[]} // TODO: Fetch from service
                  onDiscussionClick={(discussionId) => {
                    router.push(
                      `/habitats/${state.habitat?.id}/discussions/${discussionId}`
                    );
                  }}
                  onPollClick={(pollId) => {
                    // TODO: Navigate to poll or open poll modal
                    console.log("Poll clicked:", pollId);
                  }}
                  onWatchPartyClick={(watchPartyId) => {
                    // TODO: Navigate to watch party or open join modal
                    console.log("Watch party clicked:", watchPartyId);
                  }}
                />

                {/* Watch Parties Section */}
                <WatchParties
                  watchParties={[]} // TODO: Fetch from service
                  onJoinParty={(watchPartyId) => {
                    // TODO: Implement join watch party
                    console.log("Join watch party:", watchPartyId);
                  }}
                  onLeaveParty={(watchPartyId) => {
                    // TODO: Implement leave watch party
                    console.log("Leave watch party:", watchPartyId);
                  }}
                  onEnterParty={(watchPartyId) => {
                    // TODO: Navigate to watch party room
                    console.log("Enter watch party:", watchPartyId);
                  }}
                  onCreateParty={() => {
                    // TODO: Open watch party creation modal
                    console.log("Create watch party");
                  }}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <HabitatInfo
                  habitat={state.habitat}
                  members={[]} // TODO: Fetch from service
                  onlineMembers={[]} // TODO: Fetch from service
                  onViewAllMembers={() => {
                    // TODO: Open members modal or navigate to members page
                    console.log("View all members");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback state (shouldn't happen)
  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      <ErrorState message="Something went wrong" onRetry={handleRetry} />
    </div>
  );
}
