"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import type { PlaybackState } from "../domain/stream.types";

interface UsePlaybackSyncProps {
  streamId: string;
  userId: string;
  isHost: boolean;
}

interface PlaybackSyncState {
  playbackState: PlaybackState;
  isConnected: boolean;
  lastSyncAt: Date | null;
  broadcastPlaybackState: (state: Partial<PlaybackState>) => Promise<void>;
  handleIncomingSync: (
    incomingState: Partial<PlaybackState>,
    currentState: PlaybackState
  ) => void;
  setConnectionStatus: (connected: boolean) => void;
}

const SYNC_TOLERANCE = 0.5; // seconds

export function usePlaybackSync({
  streamId,
  userId: _userId, // Prefix with underscore to indicate intentionally unused
  isHost,
}: UsePlaybackSyncProps): PlaybackSyncState {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    volume: 1,
    isFullscreen: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase.channel(`stream:${streamId}:playback`);

    channel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "streams",
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          // Handle incoming playback sync
          const newState = payload.new;
          if (newState && !isHost) {
            handleIncomingSync(
              {
                currentTime: newState.current_time,
                isPlaying: newState.is_playing,
              },
              playbackState
            );
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [streamId, isHost, playbackState]);

  const broadcastPlaybackState = useCallback(
    async (state: Partial<PlaybackState>) => {
      if (!isHost) return;

      try {
        await supabase
          .from("streams")
          .update({
            current_time: state.currentTime,
            is_playing: state.isPlaying,
            last_sync_at: new Date().toISOString(),
          })
          .eq("id", streamId)
          .select();

        setLastSyncAt(new Date());
      } catch (error) {
        console.error("Error broadcasting playback state:", error);
      }
    },
    [isHost, streamId]
  );

  const handleIncomingSync = useCallback(
    (incomingState: Partial<PlaybackState>, currentState: PlaybackState) => {
      // Apply sync tolerance to prevent micro-adjustments
      if (
        incomingState.currentTime !== undefined &&
        currentState.currentTime !== undefined
      ) {
        const timeDiff = Math.abs(
          incomingState.currentTime - currentState.currentTime
        );
        if (timeDiff < SYNC_TOLERANCE) {
          return; // Skip sync if within tolerance
        }
      }

      setPlaybackState((prev) => ({
        ...prev,
        ...incomingState,
      }));
      setLastSyncAt(new Date());
    },
    []
  );

  const setConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  return {
    playbackState,
    isConnected,
    lastSyncAt,
    broadcastPlaybackState,
    handleIncomingSync,
    setConnectionStatus,
  };
}
