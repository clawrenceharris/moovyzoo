"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
// TODO: Add toast library (e.g., sonner) for user feedback
import {
  ParticipantsSidebar,
  StreamChat,
  StreamHero,
  StreamVideoPlayer,
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
import { getUserErrorMessage } from "@/utils/normalize-error";
import { getMovieDetails } from "@/app/api/tmdb/repository";

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
    data: stream,
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
  const currentStream = stream || initialData.stream;
  const currentParticipants =
    participants.length > 0 ? participants : initialData.participants;

  // Check user participation status
  const userParticipant = currentParticipants.find(
    (p) => p.user_id === user.id
  );
  const userParticipation: UserParticipationStatus = {
    isParticipant: !!userParticipant,
    canJoin: !userParticipant,
    canLeave: !!userParticipant && !userParticipant.is_host,
    joinedAt: userParticipant
      ? new Date(
          currentParticipants.find((p) => p.user_id === user.id)?.joined_at ||
            new Date()
        )
      : undefined,
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<string[]>([]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  const fetchVideos = async () => {
    try {
      if (!stream) {
        return;
      }
      const movie = await getMovieDetails(stream.tmdb_id);
      setVideos(movie?.videos?.results.map((v) => v.key) || []);
      console.log(movie);
    } catch (error) {
      console.error(getUserErrorMessage(error));
    }
  };
  useEffect(() => {
    fetchVideos();
  }, []);

  // Loading state
  if (isLoadingSession && !currentStream) {
    return <LoadingState variant="page" />;
  }

  // Error state
  if (sessionError && !currentStream) {
    return (
      <div className="space-y-8">
        <Button
          onClick={router.back}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <ErrorState
          title="Failed to Load Stream"
          message="We couldn't load this Stream. Please try again."
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
          onClick={router.back}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <ErrorState
          title="Private Session"
          message="This is a private Stream. You need an invitation to join."
          action={
            <Button onClick={() => router.push("/streams")}>
              Browse Public Sessions
            </Button>
          }
        />
      </div>
    );
  }

  // Check if user has media access (participant or public stream)
  const hasMediaAccess = userParticipant || visibility.type === "public";
  if (!stream) {
    return (
      <ErrorState variant="card" message="We couldn't find this Stream." />
    );
  }
  if (!hasMediaAccess) {
    return (
      <div className="space-y-8">
        {/* Back Navigation */}
        <Button
          onClick={router.back}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Hero Section */}
        <StreamHero
          userId={user.id}
          userParticipation={userParticipation}
          stream={currentStream}
        />

        {/* Participants Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <ParticipantsList
            participants={currentParticipants}
            currentUserId={user?.id}
            maxVisible={12}
          />
        </div>

        {/* Focus management for accessibility */}
        <div
          tabIndex={-1}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {isJoining && "Joining Stream..."}
          {isLeaving && "Leaving Stream..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-row flex-1 gap-5">
        {isPlaying ? (
          <div data-testid="video-container" className={`flex-1 aspect-video`}>
            <StreamVideoPlayer
              videos={videos}
              streamId={stream.id}
              media={stream}
              isHost={true}
              currentUserId={user.id}
            />
          </div>
        ) : (
          <StreamHero
            userId={user.id}
            onPlayClick={handlePlayClick}
            stream={stream}
            userParticipation={userParticipation}
          />
        )}

        <div className={"flex flex-col gap-0"}>
          <div className="flex-1">
            <StreamChat streamId={stream.id} currentUserId={user.id} />
          </div>
        </div>
      </div>
      <ParticipantsSidebar
        className="flex-1"
        streamId={stream.id}
        participants={participants}
        currentUserId={user.id}
        isHost={currentParticipants.some(
          (p) => p.user_id === user?.id && p.is_host
        )}
      />
    </div>
  );
}
