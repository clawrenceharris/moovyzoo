"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HabitatHero } from "./HabitatHero";
import { HabitatDiscussions } from "./HabitatDiscussions";
import { HabitatStreams } from "./HabitatStreams";
import { HabitatInfo } from "./HabitatInfo";
import { LoadingState, ErrorState } from "@/components";
import type { HabitatDashboardData } from "../domain/habitats.types";
import { getUserErrorMessage } from "@/utils/normalize-error";
import { useHabitatDashboard } from "@/hooks/queries/use-habitat-queries";
import useModal from "@/hooks/use-modal";
import { StreamCreationForm } from "@/features/streaming/components/StreamCreationForm";
import { useJoinStream, useLeaveStream } from "@/features/streaming";

interface HabitatDashboardProps {
  habitatId: string;
  userId: string;
  className?: string;
}

export function HabitatDashboard({
  habitatId,
  userId,
  className = "",
}: HabitatDashboardProps) {
  const router = useRouter();
  const { isLoading, error, refetch, data } = useHabitatDashboard(
    habitatId,
    userId
  );
  const { mutate: joinStream } = useJoinStream();
  const { mutate: leaveStream } = useLeaveStream();

  const {
    closeModal: closeStreamCreationModal,
    openModal: openStreamCreationModal,
    modal: streamCreationModal,
  } = useModal({
    title: "Create Stream",
    children: (
      <StreamCreationForm
        isLoading={isLoading}
        onSuccess={() => {
          closeStreamCreationModal();
          refetch();
        }}
        onCancel={() => closeStreamCreationModal}
        habitatId={habitatId}
        userId={userId}
      />
    ),
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        <LoadingState variant="grid" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        <ErrorState
          title="Unable to load habitat"
          message={getUserErrorMessage(error.message)}
          onRetry={refetch}
        />
      </div>
    );
  }

  // Show dashboard
  if (data) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        {streamCreationModal}
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
              {data.habitat.name}
            </span>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          {/* Hero Section - Full Width */}
          <div className="px-6 pt-6">
            <HabitatHero
              habitat={data.habitat}
              onStartStream={openStreamCreationModal}
            />
          </div>

          {/* Streams Carousel - Prominent Feature */}
          <HabitatStreams
            userId={userId}
            streams={data.streams}
            onJoinStream={(streamId) => {
              joinStream({ streamId, userId });
              console.log("Join Stream:", streamId);
            }}
            onLeaveStream={(streamId) => {
              leaveStream({ streamId, userId });
              console.log("Leave Stream:", streamId);
            }}
            onEnterStream={(streamId) => {
              router.push(`/streams/${streamId}`);
              console.log("Enter Stream:", streamId);
            }}
            onCreateStream={openStreamCreationModal}
          />

          {/* Dashboard Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Popular in Habitat Section */}
                <HabitatDiscussions
                  loading={isLoading}
                  habitatId={habitatId}
                  discussions={data.discussions}
                  onDiscussionClick={(discussionId) => {
                    router.push(
                      `/habitats/${data.habitat.id}/discussions/${discussionId}`
                    );
                  }}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <HabitatInfo
                  habitat={data.habitat}
                  members={data.members}
                  onlineMembers={data.onlineMembers}
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
    <div className="flex flex-col h-full bg-background">
      <ErrorState message="Something went wrong" onRetry={refetch} />
    </div>
  );
}
