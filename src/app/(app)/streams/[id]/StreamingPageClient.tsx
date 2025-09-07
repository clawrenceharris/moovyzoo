"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// TODO: Add toast library (e.g., sonner) for user feedback
import {
  StreamingSessionActions,
  StreamHero,
} from "@/features/streaming/components";
import { ParticipantsList } from "@/features/streaming/components/ParticipantsList";
import { useUser } from "@/hooks/use-user";
import {
  useStream,
  useStreamParticipants,
} from "@/features/streaming/hooks/use-stream-queries";

import { LoadingState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

import type {
  StreamWithParticipants,
  StreamParticipant,
  UserParticipationStatus,
} from "@/features/streaming/domain/stream.types";
import { useJoinStream, useLeaveStream } from "@/features/streaming";

interface StreamPageData {
  stream: StreamWithParticipants;
  participants: StreamParticipant[];
  userParticipation: UserParticipationStatus;
  canJoin: boolean;
  canLeave: boolean;
  hasViewPermission: boolean;
}

interface StreamPageClientProps {
  initialData: StreamPageData;
  streamId: string;
  visibility: {
    type: "public" | "private" | "unlisted";
    allowedParticipants?: string[];
  };
}

export function StreamPageClient({
  initialData,
  streamId,
  visibility,
}: StreamPageClientProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Real-time data fetching with initial data
  const {
    data: streamingSession,
    isLoading: isLoadingSession,
    error: sessionError,
    refetch: refetchSession,
  } = useStream(streamId);

  const {
    data: participants = [],
    isLoading: isLoadingParticipants,
    error: participantsError,
    refetch: refetchParticipants,
  } = useStreamParticipants(streamId);

  // Mutations for join/leave actions
  const joinMutation = useJoinStream();
  const leaveMutation = useLeaveStream();

  // Use initial data if real-time data is still loading
  const currentSession = streamingSession || initialData.stream;
  const currentParticipants =
    participants.length > 0 ? participants : initialData.participants;

  // Check user participation status
  const isParticipant = user
    ? currentParticipants.some((p) => p.user_id === user.id)
    : false;
  const userParticipation = {
    isParticipant,
    canJoin: !isParticipant && !!user,
    canLeave: isParticipant,
    joinedAt: isParticipant
      ? new Date(
          currentParticipants.find((p) => p.user_id === user.id)?.joined_at ||
            new Date()
        )
      : undefined,
  };

  // Handle join session
  const handleJoin = useCallback(async () => {
    if (!user) {
      console.log("Please log in to join the session");
      return;
    }

    setIsJoining(true);
    try {
      await joinMutation.mutateAsync({
        streamId: streamId,
        userId: user.id,
      });

      console.log("Successfully joined the streaming session!");

      // Refetch data to update UI
      await Promise.all([refetchSession(), refetchParticipants()]);
    } catch (error) {
      console.error("Failed to join session:", error);
      console.error("Failed to join session. Please try again.");
    } finally {
      setIsJoining(false);
    }
  }, [user, streamId, joinMutation, refetchSession, refetchParticipants]);

  // Handle leave session
  const handleLeave = useCallback(async () => {
    if (!user) return;

    setIsLeaving(true);
    try {
      await leaveMutation.mutateAsync({
        streamId: streamId,
        userId: user.id,
      });

      console.log("Successfully left the streaming session");

      // Refetch data to update UI
      await Promise.all([refetchSession(), refetchParticipants()]);
    } catch (error) {
      console.error("Failed to leave session:", error);
      console.error("Failed to leave session. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  }, [user, streamId, leaveMutation, refetchSession, refetchParticipants]);

  // Handle share functionality
  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/streams/${streamId}`;
    const title = currentSession.media_title;

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Streaming Session`,
          text: `Join me for a streaming session of ${title}!`,
          url,
        });
        return;
      } catch (error) {
        // User cancelled or API not supported, fall back to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      console.log("Link copied to clipboard!");
    } catch (error) {
      // Final fallback - show the URL
      console.log(`Share this link: ${url}`);
    }
  }, [streamId, currentSession]);

  // Handle back navigation
  const handleBackNavigation = useCallback(() => {
    const referrer = document.referrer;
    const searchParams = new URLSearchParams(window.location.search);
    const returnUrl = searchParams.get("return");

    if (returnUrl) {
      router.push(returnUrl);
    } else if (referrer.includes("/habitats/")) {
      router.back();
    } else if (referrer.includes("/streams")) {
      router.push("/streams");
    } else {
      router.push("/");
    }
  }, [router]);

  // Loading state
  if (isLoadingSession && !currentSession) {
    return <LoadingState variant="page" />;
  }

  // Error state
  if (sessionError && !currentSession) {
    return (
      <div className="space-y-8">
        <Button
          onClick={handleBackNavigation}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <ErrorState
          title="Failed to Load Streaming Session"
          message="We couldn't load this streaming session. Please try again."
          onRetry={() => refetchSession()}
        />
      </div>
    );
  }

  // Permission check for private sessions
  if (
    visibility.type === "private" &&
    user &&
    !visibility.allowedParticipants?.includes(user.id)
  ) {
    return (
      <div className="space-y-8">
        <Button
          onClick={handleBackNavigation}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <ErrorState
          title="Private Session"
          message="This is a private streaming session. You need an invitation to join."
          action={
            <Button onClick={() => router.push("/streams")}>
              Browse Public Sessions
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Navigation */}
      <Button
        onClick={handleBackNavigation}
        variant="ghost"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Hero Section */}
      <StreamHero stream={currentSession} />

      {/* Actions Section */}
      <StreamingSessionActions
        stream={currentSession}
        userParticipation={userParticipation}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onShare={handleShare}
        isJoining={isJoining}
        isLeaving={isLeaving}
        visibility={visibility.type}
      />

      {/* Participants Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        {isLoadingParticipants && currentParticipants.length === 0 ? (
          <LoadingState variant="card" />
        ) : participantsError ? (
          <ErrorState
            title="Failed to Load Participants"
            message="We couldn't load the participants list."
            onRetry={() => refetchParticipants()}
            variant="inline"
          />
        ) : (
          <ParticipantsList
            participants={currentParticipants}
            currentUserId={user?.id}
            maxVisible={12}
          />
        )}
      </div>

      {/* Focus management for accessibility */}
      <div
        tabIndex={-1}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isJoining && "Joining streaming session..."}
        {isLeaving && "Leaving streaming session..."}
      </div>
    </div>
  );
}
