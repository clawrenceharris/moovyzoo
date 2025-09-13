"use client";

import { PlaybackState } from "@/features/streaming";
import React from "react";

interface SyncDebugPanelProps {
  streamId: string;
  userId: string;
  isHost: boolean;
  videosCount: number;
  syncStatus: string;
  isConnected: boolean;
  error?: string | null;
  playbackState: PlaybackState;
}

export function SyncDebugPanel({
  streamId,
  userId,
  isHost,
  videosCount,
  playbackState,
  syncStatus,
  isConnected,
  error,
}: SyncDebugPanelProps) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  // Only render if there's meaningful data to show
  if (!streamId || !userId) {
    return null;
  }

  return (
    <div className="z-100 fixed bottom-4 left-4 bg-black/90 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <h3 className="font-bold mb-2 text-yellow-400">🐛 Debug</h3>
      <div className="space-y-1">
        <div>Host: {isHost ? "✅" : "❌"}</div>
        <div>Videos: {videosCount}</div>
        <div>Status: {syncStatus || "unknown"}</div>
        <div>Playing: {playbackState.isPlaying ? "✅" : "❌"}</div>
        <div>Current Time: {playbackState.time}</div>

        <div>Connected: {isConnected ? "✅" : "❌"}</div>
        {error && (
          <div className="text-red-400">Error: {error.slice(0, 30)}...</div>
        )}
      </div>
    </div>
  );
}
