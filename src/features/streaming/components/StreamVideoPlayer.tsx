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
  StreamMedia,
  PlaybackState,
  SyncStatus,
} from "../domain/stream.types";
import YouTube from "react-youtube";

interface StreamVideoPlayerProps {
  streamId: string;
  media: StreamMedia;
  isHost: boolean;
  currentUserId: string;
  onPlaybackChange?: (state: PlaybackState) => void;
  onSyncStatusChange?: (status: SyncStatus) => void;
  videos?: string[]; // Made optional for backward compatibility
  syncEnabled?: boolean;
}

export function StreamVideoPlayer({
  streamId,
  media,
  isHost,
  currentUserId,
  onPlaybackChange,
  onSyncStatusChange,
  videos = [],
  syncEnabled = true,
}: StreamVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef(null);
  const youtubePlayerRef = useRef(null);

  // Initialize playback synchronization with YouTube player ref
  const {
    playbackState,
    syncStatus,
    isConnected,
    connectionQuality,
    lastSyncAt,
    error,
    broadcastPlaybackEvent,
    processIncomingEvent,
    requestSync,
    forceSync,
    clearError,
    broadcastPlaybackState,
    setConnectionStatus,
  } = usePlaybackSync({
    streamId,
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

  // Set connection status when component mounts
  useEffect(() => {
    setConnectionStatus(true);
  }, [setConnectionStatus]);

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
  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  // Legacy video controls
  const handlePlayPause = useCallback(() => {
    const video = document.querySelector("video");
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  }, [isPlaying]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
      }
    },
    [handlePlayPause]
  );

  // YouTube player event handlers
  const handleYouTubeReady = useCallback((event: any) => {
    youtubePlayerRef.current = event.target;
  }, []);

  const handleYouTubeStateChange = useCallback(
    async (event: any) => {
      if (!isHost || !syncEnabled) return;

      const player = event.target;
      const currentTime = player.getCurrentTime();
      const playerState = player.getPlayerState();

      // Broadcast state changes to participants
      const playbackEvent = {
        type: playerState === 1 ? "play" : "pause",
        timestamp: Date.now(),
        currentTime,
        hostUserId: currentUserId,
        eventId: `yt-${Date.now()}-${Math.random()}`,
      };

      await broadcastPlaybackEvent(playbackEvent);
    },
    [isHost, syncEnabled, currentUserId, broadcastPlaybackEvent]
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
            onClick={handleRetry}
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
    const { currentTime, duration, isPlaying } = playbackState;

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
          {formatTime(currentTime)} / {formatTime(duration)}
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
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden focus:outline-none ${
        isMobile ? "mobile-optimized" : ""
      }`}
      tabIndex={0}
      data-testid="video-player-container"
      onKeyDown={handleKeyDown}
    >
      {/* YouTube Video Player */}
      {videos.length > 0 && (
        <YouTube
          videoId={videos[0]}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 0,
              controls: isHost ? 1 : 0, // Only show controls for hosts
              disablekb: !isHost ? 1 : 0, // Disable keyboard controls for participants
              fs: 1,
              rel: 0,
            },
          }}
        />
      )}

      {/* Legacy Video Player for backward compatibility */}
      {videos.length === 0 && (media as any).video_url && (
        <video
          className="w-full h-full object-cover"
          src={(media as any).video_url}
          controls={isHost}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) =>
            setCurrentTime((e.target as HTMLVideoElement).currentTime)
          }
          onLoadedMetadata={(e) =>
            setDuration((e.target as HTMLVideoElement).duration)
          }
        />
      )}

      {/* Fallback for no video */}
      {videos.length === 0 && !(media as any).video_url && (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{media.media_title}</h3>
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

      {/* Legacy Controls for backward compatibility */}
      {videos.length === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <Button
              size="sm"
              variant="ghost"
              disabled={!isHost}
              className="text-white hover:bg-white/20"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Progress Bar */}
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Progress"
                disabled={!isHost}
              />
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>

            {/* Fullscreen Button */}
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              aria-label="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State for legacy mode */}
      {videos.length === 0 && !isPlaying && currentTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* Retry Button for errors */}
      {videos.length === 0 && (
        <div className="absolute top-4 right-4">
          <Button
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
  );
}
