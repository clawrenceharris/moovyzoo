"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HabitatHero } from "./HabitatHero";
import { HabitatDiscussions } from "./HabitatDiscussions";
import { HabitatWatchParties } from "./HabitatWatchParties";
import { HabitatInfo } from "./HabitatInfo";
import { PollCreationModal } from "./PollCreationModal";
import { WatchPartyCreationModal } from "./WatchPartyCreationModal";
import { LoadingState, ErrorState } from "@/components";
import { habitatsService } from "../domain/habitats.service";
import type {
  HabitatDashboardData,
  Poll,
  WatchParty,
} from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";

interface HabitatDashboardProps {
  habitatId: string;
  userId: string;
  className?: string;
}

interface HabitatDashboardState {
  dashboardData: HabitatDashboardData | null;
  loading: boolean;
  error: string | null;
}

interface ModalState {
  discussionModal: boolean;
  pollModal: boolean;
  watchPartyModal: boolean;
}

export function HabitatDashboard({
  habitatId,
  userId,
  className = "",
}: HabitatDashboardProps) {
  const router = useRouter();
  const [state, setState] = useState<HabitatDashboardState>({
    dashboardData: null,
    loading: true,
    error: null,
  });

  const [modals, setModals] = useState<ModalState>({
    discussionModal: false,
    pollModal: false,
    watchPartyModal: false,
  });

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!habitatId || !userId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const dashboardData = await habitatsService.getDashboardData(
        habitatId,
        userId
      );
      setState({
        dashboardData,
        loading: false,
        error: null,
      });
    } catch (error) {
      const normalizedError = normalizeError(error);
      setState({
        dashboardData: null,
        loading: false,
        error: normalizedError.message,
      });
    }
  }, [habitatId, userId]);

  // Load dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Modal management
  const openModal = (modalType: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modalType]: true }));
  };

  const closeModal = (modalType: keyof ModalState) => {
    setModals((prev) => ({ ...prev, [modalType]: false }));
  };

  const handlePollCreated = useCallback(
    (poll: Poll) => {
      // Refresh dashboard data to show new poll
      fetchDashboardData();
    },
    [fetchDashboardData]
  );

  const handleWatchPartyCreated = useCallback(
    (watchParty: WatchParty) => {
      // Refresh dashboard data to show new watch party
      fetchDashboardData();
    },
    [fetchDashboardData]
  );

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
  if (state.dashboardData) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        {/* Breadcrumb Navigation */}
        <div className="border-b border-border  px-6 py-3 backdrop-blur-md">
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
              {state.dashboardData.habitat.name}
            </span>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-background">
          {/* Hero Section - Full Width */}
          <div className="px-6 pt-6">
            <HabitatHero
              habitat={state.dashboardData.habitat}
              onStartStreamingParty={() => openModal("watchPartyModal")}
              onCreatePoll={() => openModal("pollModal")}
            />
          </div>

          {/* Watch Parties Carousel - Prominent Feature */}
          <HabitatWatchParties
            watchParties={state.dashboardData.watchParties}
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
            onCreateParty={() => openModal("watchPartyModal")}
          />

          {/* Dashboard Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Popular in Habitat Section */}
                <HabitatDiscussions
                  loading={state.loading}
                  habitatId={habitatId}
                  discussions={state.dashboardData.discussions}
                  onDiscussionClick={(discussionId) => {
                    router.push(
                      `/habitats/${state.dashboardData?.habitat.id}/discussions/${discussionId}`
                    );
                  }}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <HabitatInfo
                  habitat={state.dashboardData.habitat}
                  members={state.dashboardData.members}
                  onlineMembers={state.dashboardData.onlineMembers}
                  onViewAllMembers={() => {
                    // TODO: Open members modal or navigate to members page
                    console.log("View all members");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <PollCreationModal
          isOpen={modals.pollModal}
          onClose={() => closeModal("pollModal")}
          habitatId={habitatId}
          userId={userId}
          onSuccess={handlePollCreated}
        />

        <WatchPartyCreationModal
          isOpen={modals.watchPartyModal}
          onClose={() => closeModal("watchPartyModal")}
          habitatId={habitatId}
          userId={userId}
          onSuccess={handleWatchPartyCreated}
        />
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
