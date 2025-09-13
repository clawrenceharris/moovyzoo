"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  PictureInPicture,
  Settings,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./StreamingVideoPlayer.module.css";

interface VideoQuality {
  label: string;
  src: string;
}

interface StreamingVideoPlayerProps {
  src: string;
  title: string;
  poster?: string;
  qualities?: VideoQuality[];
  loading?: boolean;
  error?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  className?: string;
}

export function StreamingVideoPlayer({
  src,
  title,
  poster,
  qualities = [],
  loading = false,
  error,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onQualityChange,
  className,
}: StreamingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(
    qualities.length > 0 ? qualities[0] : null
  );

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        onPause?.();
      } else {
        await videoRef.current.play();
        onPlay?.();
      }
    } catch (err) {
      console.error("Error playing/pausing video:", err);
    }
  }, [isPlaying, onPlay, onPause]);

  // Handle seek
  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;

      const time = parseFloat(e.target.value);
      videoRef.current.time = time;
      setCurrentTime(time);
      onSeek?.(time);
    },
    [onSeek]
  );

  // Handle volume change
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;

      const newVolume = parseFloat(e.target.value);
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      onVolumeChange?.(newVolume);
    },
    [onVolumeChange]
  );

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);

    if (newMuted) {
      onVolumeChange?.(0);
    } else {
      onVolumeChange?.(volume);
    }
  }, [isMuted, volume, onVolumeChange]);

  // Handle fullscreen
  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  }, []);

  // Handle picture-in-picture
  const handlePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Error toggling picture-in-picture:", err);
    }
  }, []);

  // Handle quality change
  const handleQualityChange = useCallback(
    (quality: VideoQuality) => {
      if (!videoRef.current) return;

      const time = videoRef.current.time;
      const wasPlaying = !videoRef.current.paused;

      setSelectedQuality(quality);
      videoRef.current.src = quality.src;
      videoRef.current.time = time;

      if (wasPlaying) {
        videoRef.current.play();
      }

      onQualityChange?.(quality);
      setShowQualityMenu(false);
    },
    [onQualityChange]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
          e.preventDefault();
          handleFullscreen();
          break;
        case "m":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.time = Math.max(0, videoRef.current.time - 10);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.time = Math.min(
              duration,
              videoRef.current.time + 10
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            onVolumeChange?.(newVolume);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            onVolumeChange?.(newVolume);
          }
          break;
      }
    },
    [
      handlePlayPause,
      handleFullscreen,
      handleMuteToggle,
      volume,
      duration,
      onVolumeChange,
    ]
  );

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.time);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("volumechange", handleVolumeChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      clearTimeout(timeout);
      if (isPlaying) {
        setShowControls(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isPlaying]);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading video</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label={`Video player for ${title}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={selectedQuality?.src || src}
        poster={poster}
        className="w-full h-full"
        aria-label={`${title} video`}
      />

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Play/Pause overlay button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 text-white"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={time}
              onChange={handleSeek}
              className={cn(
                "w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer",
                styles.slider
              )}
              aria-label="Seek video"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
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
                  className={cn(
                    "w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer",
                    styles.slider
                  )}
                  aria-label="Volume control"
                />
              </div>

              <div className="text-white text-sm">
                {formatTime(time)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {qualities.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:bg-white/20"
                    aria-label="Quality settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-24">
                      {qualities.map((quality) => (
                        <button
                          key={quality.label}
                          onClick={() => handleQualityChange(quality)}
                          className={cn(
                            "block w-full text-left px-3 py-1 text-sm rounded hover:bg-white/20",
                            selectedQuality?.label === quality.label
                              ? "text-blue-400"
                              : "text-white"
                          )}
                        >
                          {quality.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePictureInPicture}
                className="text-white hover:bg-white/20"
                aria-label="Picture in picture"
              >
                <PictureInPicture className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20"
                aria-label="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
