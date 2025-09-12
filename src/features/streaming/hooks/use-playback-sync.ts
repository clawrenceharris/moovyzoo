"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import type {
  PlaybackState,
  PlaybackEvent,
  SyncStatus,
  ConnectionQuality,
  YouTubePlayer,
} from "../domain/stream.types";

interface UsePlaybackSyncProps {
  streamId: string;
  userId: string;
  isHost: boolean;
  youtubePlayerRef?: React.RefObject<YouTubePlayer>;
}

interface PlaybackSyncState {
  playbackState: PlaybackState;
  syncStatus: SyncStatus;
  isConnected: boolean;
  connectionQuality: ConnectionQuality;
  lastSyncAt: Date | null;
  error: string | null;

  // Enhanced methods for YouTube integration
  broadcastPlaybackEvent: (event: PlaybackEvent) => Promise<void>;
  processIncomingEvent: (event: PlaybackEvent) => Promise<void>;
  requestSync: () => Promise<void>;
  forceSync: () => Promise<void>;
  clearError: () => void;

  // Legacy methods (maintained for backward compatibility)
  broadcastPlaybackState: (state: Partial<PlaybackState>) => Promise<void>;
  handleIncomingSync: (
    incomingState: Partial<PlaybackState>,
    currentState: PlaybackState
  ) => void;
  setConnectionStatus: (connected: boolean) => void;
}

const SYNC_TOLERANCE = 0.5; // seconds
const DEBOUNCE_DELAY = 300; // milliseconds
const LARGE_SYNC_THRESHOLD = 2.0; // seconds

// YouTube Player States
const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

export function usePlaybackSync({
  streamId,
  userId,
  isHost,
  youtubePlayerRef,
}: UsePlaybackSyncProps): PlaybackSyncState {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    currentTime: 0,
    isPlaying: false,
    duration: 0,
    volume: 1,
    isFullscreen: false,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>("disconnected");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] =
    useState<ConnectionQuality>("good");
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedEventsRef = useRef<Set<string>>(new Set());

  // Helper function to get YouTube player
  const getYouTubePlayer = useCallback((): YouTubePlayer | null => {
    return youtubePlayerRef?.current || null;
  }, [youtubePlayerRef]);

  // Helper function to calculate lag compensation
  const calculateLagCompensation = useCallback(
    (eventTimestamp: number): number => {
      const now = Date.now();
      const networkDelay = (now - eventTimestamp) / 1000; // Convert to seconds
      return Math.min(networkDelay, 1.0); // Cap at 1 second
    },
    []
  );

  // Helper function to apply sync to YouTube player
  const applySyncToPlayer = useCallback(
    async (event: PlaybackEvent): Promise<void> => {
      const player = getYouTubePlayer();
      if (!player) return;

      try {
        const lagCompensation = calculateLagCompensation(event.timestamp);
        const adjustedTime = event.currentTime + lagCompensation;

        switch (event.type) {
          case "play":
            await player.seekTo(adjustedTime, true);
            player.playVideo();
            break;
          case "pause":
            await player.seekTo(adjustedTime, true);
            player.pauseVideo();
            break;
          case "seek":
            await player.seekTo(adjustedTime, true);
            break;
        }

        setPlaybackState((prev) => ({
          ...prev,
          currentTime: adjustedTime,
          isPlaying: event.type === "play",
        }));

        setLastSyncAt(new Date());
        setSyncStatus("connected");
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown YouTube API error";
        setError(errorMessage);
        setSyncStatus("error");
      }
    },
    [getYouTubePlayer, calculateLagCompensation]
  );

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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setSyncStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setIsConnected(false);
          setSyncStatus("error");
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [streamId, isHost, playbackState]);

  // Enhanced broadcast method with debouncing
  const broadcastPlaybackEvent = useCallback(
    async (event: PlaybackEvent) => {
      if (!isHost) return;

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce rapid events
      debounceTimerRef.current = setTimeout(async () => {
        try {
          setSyncStatus("syncing");

          await supabase
            .from("streams")
            .update({
              current_time: event.currentTime,
              is_playing: event.type === "play",
              last_sync_at: new Date().toISOString(),
            })
            .eq("id", streamId)
            .select();

          setLastSyncAt(new Date());
          setSyncStatus("connected");
          setError(null);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Broadcast failed";
          setError(errorMessage);
          setSyncStatus("error");
          console.error("Error broadcasting playback event:", err);
        }
      }, DEBOUNCE_DELAY);
    },
    [isHost, streamId]
  );

  // Process incoming sync events
  const processIncomingEvent = useCallback(
    async (event: PlaybackEvent) => {
      // Prevent processing duplicate events
      if (processedEventsRef.current.has(event.eventId)) {
        return;
      }
      processedEventsRef.current.add(event.eventId);

      // Clean up old processed events (keep last 100)
      if (processedEventsRef.current.size > 100) {
        const eventsArray = Array.from(processedEventsRef.current);
        processedEventsRef.current = new Set(eventsArray.slice(-50));
      }

      if (isHost) return; // Hosts don't process incoming events

      await applySyncToPlayer(event);
    },
    [isHost, applySyncToPlayer]
  );

  // Request sync from host
  const requestSync = useCallback(async () => {
    if (isHost) return;

    const syncRequestEvent: PlaybackEvent = {
      type: "sync_request",
      timestamp: Date.now(),
      currentTime: 0,
      hostUserId: userId,
      eventId: `sync-request-${Date.now()}`,
    };

    await processIncomingEvent(syncRequestEvent);
  }, [isHost, userId, processIncomingEvent]);

  // Force immediate sync
  const forceSync = useCallback(async () => {
    const player = getYouTubePlayer();
    if (!player) return;

    try {
      const currentTime = player.getCurrentTime();
      const isPlaying = player.getPlayerState() === YT_PLAYER_STATE.PLAYING;

      const forceSyncEvent: PlaybackEvent = {
        type: isPlaying ? "play" : "pause",
        timestamp: Date.now(),
        currentTime,
        hostUserId: userId,
        eventId: `force-sync-${Date.now()}`,
      };

      await applySyncToPlayer(forceSyncEvent);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Force sync failed";
      setError(errorMessage);
    }
  }, [getYouTubePlayer, userId, applySyncToPlayer]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    if (syncStatus === "error") {
      setSyncStatus("disconnected");
    }
  }, [syncStatus]);

  // Legacy method for backward compatibility
  const broadcastPlaybackState = useCallback(
    async (state: Partial<PlaybackState>) => {
      if (!isHost) return;

      const event: PlaybackEvent = {
        type: state.isPlaying ? "play" : "pause",
        timestamp: Date.now(),
        currentTime: state.currentTime || 0,
        hostUserId: userId,
        eventId: `legacy-${Date.now()}`,
      };

      await broadcastPlaybackEvent(event);
    },
    [isHost, userId, broadcastPlaybackEvent]
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
    // State
    playbackState,
    syncStatus,
    isConnected,
    connectionQuality,
    lastSyncAt,
    error,

    // Enhanced methods
    broadcastPlaybackEvent,
    processIncomingEvent,
    requestSync,
    forceSync,
    clearError,

    // Legacy methods (backward compatibility)
    broadcastPlaybackState,
    handleIncomingSync,
    setConnectionStatus,
  };
}
