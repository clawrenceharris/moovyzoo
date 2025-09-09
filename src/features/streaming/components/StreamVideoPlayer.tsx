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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaybackSync } from "../hooks/use-playback-sync";
import type { StreamMedia, PlaybackState } from "../domain/stream.types";
import YouTube from "react-youtube";
interface StreamVideoPlayerProps {
  streamId: string;
  media: StreamMedia;
  isHost: boolean;
  currentUserId: string;
  onPlaybackChange?: (state: PlaybackState) => void;
  videos: string[];
}

export function StreamVideoPlayer({
  streamId,
  media,
  isHost,
  currentUserId,
  onPlaybackChange,
  videos,
}: StreamVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  // Initialize playback synchronization
  const {
    playbackState,
    isConnected,
    lastSyncAt,
    broadcastPlaybackState,
    setConnectionStatus,
  } = usePlaybackSync({
    streamId,
    userId: currentUserId,
    isHost,
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

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden focus:outline-none ${
        isMobile ? "mobile-optimized" : ""
      }`}
      tabIndex={0}
      data-testid="video-player-container"
    >
      {/* Video Element */}
      {videos.length && <YouTube videoId={videos[0]} />}

      {/* Host/Participant Indicator */}
      {!isHost && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
          View Only
        </div>
      )}

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-2 left-2 bg-red-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Connection Lost
        </div>
      )}

      {isConnected && lastSyncAt && (
        <div className="absolute top-2 left-2 bg-green-600 bg-opacity-90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          Connected
        </div>
      )}
    </div>
  );
}
