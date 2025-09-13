"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaybackSync } from "../hooks/use-playback-sync";
import type {
  PlaybackState,
  SyncStatus,
  PlaybackEvent,
  StreamWithParticipants,
  UserParticipationStatus,
} from "../domain/stream.types";
import YouTube from "react-youtube";
import { StreamHero } from "./StreamHero";
import { SyncDebugPanel } from "@/components/debug/SyncDebugPanel";

interface StreamVideoPlayerProps {
  stream: StreamWithParticipants;
  isHost: boolean;
  currentUserId: string;
  onPlaybackChange?: (state: PlaybackState) => void;
  onSyncStatusChange?: (status: SyncStatus) => void;
  onRefresh: () => void;
  userParticipation: UserParticipationStatus;
  videos?: string[]; // Made optional for backward compatibility
  syncEnabled?: boolean;
  userId: string;
}

export function StreamVideoPlayer({
  stream,
  isHost,
  currentUserId,
  onPlaybackChange,
  onSyncStatusChange,
  userParticipation,
  userId,
  videos = [],
  onRefresh,
  syncEnabled = true,
}: StreamVideoPlayerProps) {
  // Removed render loop log
  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHostReady, setIsHostReady] = useState(false);
  const containerRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  // Initialize playback synchronization with YouTube player ref
  const {
    playbackState,
    syncStatus,
    isConnected,
    connectionQuality,
    error,
    broadcastPlaybackEvent,
    requestSync,
    forceSync,
    clearError,
    startPlayback,
    updatePlaybackState,
  } = usePlaybackSync({
    streamId: stream.id,
    userId: currentUserId,
    isHost,
    youtubePlayerRef,
  });

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Notify parent of sync status changes
  useEffect(() => {
    if (onSyncStatusChange) {
      onSyncStatusChange(syncStatus);
    }
  }, [syncStatus, onSyncStatusChange]);

  // Notify parent of playback changes
  useEffect(() => {
    if (onPlaybackChange) {
      onPlaybackChange(playbackState);
    }
  }, [playbackState, onPlaybackChange]);

  // Format time for display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Handle manual sync request
  const handleManualSync = useCallback(async () => {
    try {
      await requestSync();
    } catch (err) {
      console.error("Manual sync failed:", err);
    }
  }, [requestSync]);

  // Handle force sync
  const handleForceSync = useCallback(async () => {
    try {
      await forceSync();
    } catch (err) {
      console.error("Force sync failed:", err);
    }
  }, [forceSync]);

  // Handle retry/clear error
  const handleRefresh = useCallback(() => {
    clearError();
    onRefresh();
  }, [clearError]);

  // YouTube player event handlers
  const handleYouTubeReady = useCallback((event: any) => {
    youtubePlayerRef.current = event.target;
    requestSync();
  }, []);

  const handleYouTubeStateChange = useCallback(
    async (event: any) => {
      const player = event.target;
      const time = player.getCurrentTime();
      const playerState = player.getPlayerState();

      console.log("🎮 YouTube State Change:", {
        streamId: stream.id,
        isHost,
        syncEnabled,
        playerState,
        time,
        userId: currentUserId,
        willBroadcast: isHost && syncEnabled,
      });

      if (!isHost || !syncEnabled) {
        console.log("⏭️ Skipping broadcast - not host or sync disabled");
        return;
      }

      // Broadcast state changes to participants
      const playbackEvent: PlaybackEvent = {
        type: playerState === 1 ? "play" : "pause",
        timestamp: Date.now(),
        time,
        hostUserId: currentUserId,
        eventId: `yt-${Date.now()}-${Math.random()}`,
      };

      await broadcastPlaybackEvent(playbackEvent);

      // Also update local playback state for host
      updatePlaybackState({
        isPlaying: playbackEvent.type === "play",
        time: playbackEvent.time,
      });
    },
    [
      isHost,
      syncEnabled,
      currentUserId,
      broadcastPlaybackEvent,
      updatePlaybackState,
    ]
  );

  // Render sync status indicator
  const renderSyncStatus = () => {
    if (!syncEnabled) return null;

    if (!isConnected) {
      return (
        <div className="absolute top-2 left-2 bg-red-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <WifiOff className="h-3 w-3" data-testid="wifi-off-icon" />
          Connection Lost
        </div>
      );
    }

    if (syncStatus === "syncing") {
      return (
        <div className="absolute top-2 left-2 bg-yellow-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Syncing...
        </div>
      );
    }

    if (syncStatus === "error") {
      return (
        <div className="absolute top-2 left-2 bg-red-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Sync Error
        </div>
      );
    }

    if (connectionQuality === "poor") {
      return (
        <div className="absolute top-2 left-2 bg-orange-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Poor Connection
        </div>
      );
    }

    if (connectionQuality === "unstable") {
      return (
        <div className="absolute top-2 left-2 bg-yellow-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Unstable Connection
        </div>
      );
    }

    return (
      <div className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <Wifi className="h-3 w-3" data-testid="wifi-icon" />
        Connected
      </div>
    );
  };

  // Render manual sync controls for participants
  const renderSyncControls = () => {
    if (!syncEnabled) return null;

    return (
      <div className="absolute bottom-16 right-2 flex flex-col gap-2">
        {/* Manual sync button for participants */}
        {!isHost && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleManualSync}
            data-testid="manual-sync-button"
            className="bg-black bg-opacity-75 text-white hover:bg-opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}

        {/* Force sync button when there are errors */}
        {error && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleForceSync}
            data-testid="force-sync-button"
            className="bg-red-600 bg-opacity-90 text-white hover:bg-red-700"
          >
            <Zap className="h-4 w-4" />
          </Button>
        )}

        {/* Retry button for errors */}
        {error && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            data-testid="retry-button"
            className="bg-black bg-opacity-75 text-white border-white hover:bg-opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  // Render playback state display
  const renderPlaybackState = () => {
    const { time, duration, isPlaying } = playbackState;

    return (
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
        {/* Playing/Paused indicator */}
        {isPlaying ? (
          <Play className="h-3 w-3" data-testid="playing-indicator" />
        ) : (
          <Pause className="h-3 w-3" data-testid="paused-indicator" />
        )}

        {/* Time display */}
        <span>
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    );
  };

  // Render error message
  const renderErrorMessage = () => {
    if (!error) return null;

    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 bg-opacity-90 text-white p-4 rounded max-w-sm text-center">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
      </div>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative flex-1 h-full bg-black rounded-lg overflow-hidden focus:outline-none ${
          isMobile ? "mobile-optimized" : ""
        }`}
        tabIndex={0}
        data-testid="video-player-container"
      >
        {/* YouTube Video Player */}
        {videos.length > 0 && (isHostReady || playbackState.time > 0) ? (
          <YouTube
            className="h-full flex-1"
            videoId={videos[0]}
            opts={{
              playerVars: {
                autoplay: 1,
                controls: 1,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                start: 0,
              },
            }}
            ref={youtubePlayerRef}
            onReady={handleYouTubeReady}
            onStateChange={handleYouTubeStateChange}
          />
        ) : (
          <StreamHero
            userId={userId}
            onPlayClick={() => {
              if (isHost) {
                setIsHostReady(true);
              }
            }}
            stream={stream}
            userParticipation={userParticipation}
          />
        )}

        {/* Fallback for no video */}
        {videos.length === 0 && (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                {stream.media_title}
              </h3>
              <p className="text-sm text-gray-300">Video not available</p>
            </div>
          </div>
        )}

        {/* Host/Participant Indicator */}
        {!isHost && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            View Only
          </div>
        )}

        {/* Sync Status Indicator */}
        {renderSyncStatus()}

        {/* Manual Sync Controls */}
        {renderSyncControls()}

        {/* Playback State Display */}
        {renderPlaybackState()}

        {/* Error Message */}
        {renderErrorMessage()}

        {/* Retry Button for errors */}
        {videos.length === 0 && (
          <div className="absolute top-4 right-4">
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="bg-black bg-opacity-75 text-white border-white hover:bg-opacity-90"
              aria-label="Retry"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {/* Debug Panel */}
      <SyncDebugPanel
        streamId={stream.id}
        playbackState={playbackState}
        userId={userId}
        isHost={userParticipation.isHost || false}
        videosCount={videos.length}
        syncStatus={syncStatus}
        isConnected={isConnected}
      />
    </>
  );
}
