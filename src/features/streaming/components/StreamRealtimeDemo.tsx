"use client";

import { useStreamRealtime } from "../hooks/use-stream-realtime";
import { ConnectionStatus } from "./ConnectionStatus";
import { ParticipantActivity } from "./ParticipantActivity";

interface StreamRealtimeDemoProps {
  streamId: string;
  userId: string;
  className?: string;
}

/**
 * Demo component showing how to integrate real-time streaming functionality
 * Displays connection status and participant activity in real-time
 */
export function StreamRealtimeDemo({
  streamId,
  userId,
  className = "",
}: StreamRealtimeDemoProps) {
  const {
    connected,
    connecting,
    error,
    participantCount,
    recentJoins,
    recentLeaves,
    reconnect,
    clearError,
  } = useStreamRealtime(streamId, userId, {
    onParticipantJoin: (userId) => {
      console.log(`User ${userId} joined the stream`);
    },
    onParticipantLeave: (userId) => {
      console.log(`User ${userId} left the stream`);
    },
    onConnectionChange: (connected) => {
      console.log(
        `Connection status changed: ${connected ? "connected" : "disconnected"}`
      );
    },
    onError: (error) => {
      console.error(`Real-time error: ${error}`);
    },
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Real-time Status</h3>
        <ConnectionStatus
          connected={connected}
          connecting={connecting}
          error={error}
          onRetry={reconnect}
          compact
        />
      </div>

      {/* Participant Activity */}
      <ParticipantActivity
        recentJoins={recentJoins}
        recentLeaves={recentLeaves}
        participantCount={participantCount}
      />

      {/* Error Handling */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-red-400 font-medium">Connection Error</h4>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Dismiss
              </button>
              <button
                onClick={reconnect}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
        <h4 className="text-gray-300 font-medium mb-2">Debug Info</h4>
        <div className="space-y-1 text-gray-400">
          <div>Stream ID: {streamId}</div>
          <div>User ID: {userId}</div>
          <div>Connected: {connected ? "Yes" : "No"}</div>
          <div>Connecting: {connecting ? "Yes" : "No"}</div>
          <div>Participant Count: {participantCount}</div>
          <div>Recent Joins: {recentJoins.length}</div>
          <div>Recent Leaves: {recentLeaves.length}</div>
        </div>
      </div>
    </div>
  );
}
