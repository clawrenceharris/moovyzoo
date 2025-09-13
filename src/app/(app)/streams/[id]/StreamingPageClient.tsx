"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// TODO: Add toast library (e.g., sonner) for user feedback
import { StreamHero, StreamVideoPlayer } from "@/features/streaming/components";
import { StreamSidebar } from "@/features/streaming/components/StreamSidebar";
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
import { getMovieDetails, getTVShowDetails } from "@/app/api/tmdb/repository";
import { SyncDebugPanel } from "@/components/debug/SyncDebugPanel";

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
  const [videos, setVideos] = useState<string[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const videosFetchedRef = useRef<string | null>(null);
  const [currentPlaybackState, setCurrentPlaybackState] = useState<any>(null);
  const [currentSyncStatus, setCurrentSyncStatus] = useState<string>("unknown");

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
    isHost: userParticipant?.is_host || false,
    reminderEnabled: userParticipant?.reminder_enabled || false,
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

  const fetchVideos = useCallback(async () => {
    if (
      isLoadingVideos ||
      !stream?.tmdb_id ||
      videosFetchedRef.current === stream.tmdb_id.toString()
    ) {
      return;
    }

    setIsLoadingVideos(true);
    try {
      let videoKeys: string[] = [];
      if (stream.media_type === "movie") {
        const movie = await getMovieDetails(stream.tmdb_id);
        videoKeys = movie?.videos?.results.map((v) => v.key) || [];
        console.log("🎥 Movie fetch result:", {
          movieTitle: movie?.title,
          videoCount: videoKeys.length,
        });
      } else if (stream.media_type === "tv") {
        const tvShow = await getTVShowDetails(stream.tmdb_id);
        videoKeys = tvShow?.videos?.results.map((v) => v.key) || [];
        console.log("📺 TV Show fetch result:", {
          showTitle: tvShow?.name,
          videoCount: videoKeys.length,
        });
      }

      setVideos(videoKeys);
      videosFetchedRef.current = stream.tmdb_id.toString();
    } catch (error) {
      console.error("❌ Error fetching videos:", getUserErrorMessage(error));
    } finally {
      setIsLoadingVideos(false);
    }
  }, [stream?.tmdb_id, stream?.media_type, isLoadingVideos, streamId]);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePlaybackChange = useCallback((playbackState: any) => {
    setCurrentPlaybackState(playbackState);
  }, []);

  const handleSyncStatusChange = useCallback((syncStatus: string) => {
    setCurrentSyncStatus(syncStatus);
  }, []);

  // Fetch videos when stream data is available
  useEffect(() => {
    if (
      stream?.tmdb_id &&
      videosFetchedRef.current !== stream.tmdb_id.toString()
    ) {
      console.log("🎬 Stream data available, fetching videos");
      fetchVideos();
    }
  }, [stream?.tmdb_id, fetchVideos]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

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
        <ParticipantsList
          streamId={streamId}
          participants={currentParticipants}
          currentUserId={user.id}
          hostId={participants.find((p) => p.is_host)?.user_id}
          maxVisible={12}
        />

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
    <div className="relative flex h-fullflex-col gap-5">
      <div className="relative flex flex-col flex-1 gap-5 xl:flex-row">
        <div data-testid="video-container" className={"flex-1  aspect-video"}>
          <StreamVideoPlayer
            videos={videos}
            onRefresh={fetchVideos}
            stream={stream}
            userId={user.id}
            userParticipation={userParticipation}
            isHost={userParticipation.isHost || false}
            currentUserId={user.id}
            onPlaybackChange={handlePlaybackChange}
            onSyncStatusChange={handleSyncStatusChange}
          />
        </div>

        <StreamSidebar
          streamId={stream.id}
          participants={currentParticipants}
          currentUserId={user.id}
          isHost={currentParticipants.some(
            (p) => p.user_id === user?.id && p.is_host
          )}
        />
      </div>

      {/* Debug Panel */}
      <SyncDebugPanel
        streamId={streamId}
        userId={user.id}
        isHost={currentParticipants.some(
          (p) => p.user_id === user?.id && p.is_host
        )}
        videosCount={videos.length}
        syncStatus={currentSyncStatus}
        isConnected={true}
        playbackState={currentPlaybackState || { isPlaying: false, time: 0 }}
        error={null}
      />
    </div>
  );
}
