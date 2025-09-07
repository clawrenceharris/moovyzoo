"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { Play, Pause, Volume2, VolumeX, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamingControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  isCreator: boolean;
  loading?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function StreamingControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  isCreator,
  loading = false,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  className,
}: StreamingControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(volume === 0);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (!isCreator || loading) return;

    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }, [isCreator, loading, isPlaying, onPlay, onPause]);

  // Handle seek
  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (loading) return;

      const time = parseFloat(e.target.value);
      onSeek(time);
    },
    [loading, onSeek]
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (loading) return;

      const newVolume = parseFloat(e.target.value);
      onVolumeChange(newVolume);
      setIsMuted(newVolume === 0);
    },
    [loading, onVolumeChange]
  );

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (loading) return;

    const newVolume = isMuted ? 1 : 0;
    onVolumeChange(newVolume);
    setIsMuted(!isMuted);
  }, [loading, isMuted, onVolumeChange]);

  // Handle speed change
  const handleSpeedChange = useCallback(
    (speed: number) => {
      onSpeedChange(speed);
      setShowSpeedMenu(false);
    },
    [onSpeedChange]
  );

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isCreator) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "m":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 10));
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + 10));
          break;
        case "ArrowUp":
          e.preventDefault();
          onVolumeChange(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          onVolumeChange(Math.max(0, volume - 0.1));
          break;
      }
    },
    [
      isCreator,
      handlePlayPause,
      handleMuteToggle,
      onSeek,
      onVolumeChange,
      currentTime,
      duration,
      volume,
    ]
  );

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn("bg-gray-900 border-t border-gray-700 p-4", className)}
      role="region"
      aria-label="Streaming controls"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Creator-only message for non-creators */}
      {!isCreator && (
        <div className="mb-4 text-center">
          <p className="text-gray-400 text-sm">
            Only the session creator can control playback
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={loading}
          className={cn(
            "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer",
            "slider::-webkit-slider-thumb:appearance-none slider::-webkit-slider-thumb:w-4 slider::-webkit-slider-thumb:h-4",
            "slider::-webkit-slider-thumb:rounded-full slider::-webkit-slider-thumb:bg-white",
            "slider::-webkit-slider-thumb:cursor-pointer slider::-webkit-slider-thumb:border-2 slider::-webkit-slider-thumb:border-gray-800",
            loading && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Seek video"
        />
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Play/Pause button - only for creators */}
          {isCreator && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              disabled={loading}
              className="text-white hover:bg-white/20"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Volume controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMuteToggle}
              disabled={loading}
              className="text-white hover:bg-white/20"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              disabled={loading}
              className={cn(
                "w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer",
                loading && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Volume control"
            />
          </div>

          {/* Time display */}
          <div className="text-white text-sm">
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400"> / </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Playback speed controls */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              disabled={loading}
              className="text-white hover:bg-white/20"
              aria-label="Playback speed settings"
            >
              <Settings className="w-4 h-4" />
              <span className="ml-1 text-xs">{playbackSpeed}x</span>
            </Button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 min-w-20 shadow-lg">
                <div className="text-white text-xs mb-2 px-2">Speed</div>
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={cn(
                      "block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20",
                      playbackSpeed === speed
                        ? "text-blue-400 bg-white/10"
                        : "text-white"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
