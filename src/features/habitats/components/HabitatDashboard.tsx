"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import { HabitatHero } from "./HabitatHero";
import { HabitatDiscussions } from "./HabitatDiscussions";
import { HabitatStreams } from "./HabitatStreams";
import { HabitatInfo } from "./HabitatInfo";
import { LoadingState, ErrorState } from "@/components";
import { habitatsService } from "../domain/habitats.service";
import type { HabitatDashboardData, Poll } from "../domain/habitats.types";
import { normalizeError } from "@/utils/normalize-error";
import { Stream } from "@/features/streaming";

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
  streamModal: boolean;
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
    streamModal: false,
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

  const handleStreamCreated = useCallback(
    (stream: Stream) => {
      // Refresh dashboard data to show new streaming session
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
              onStartStream={() => openModal("streamModal")}
              onCreatePoll={() => openModal("pollModal")}
            />
          </div>

          {/* Streaming Sessions Carousel - Prominent Feature */}
          <HabitatStreams
            streams={state.dashboardData.streams}
            onJoinStream={(streamId) => {
              // TODO: Implement join streaming session
              console.log("Join streaming session:", streamId);
            }}
            onLeaveStream={(streamId) => {
              // TODO: Implement leave streaming session
              console.log("Leave streaming session:", streamId);
            }}
            onEnterStream={(streamId) => {
              // TODO: Navigate to streaming session room
              console.log("Enter streaming session:", streamId);
            }}
            onCreateStream={() => openModal("streamModal")}
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
