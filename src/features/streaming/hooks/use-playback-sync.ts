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
  youtubePlayerRef?: React.RefObject<YouTubePlayer | null>;
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
  startPlayback: () => void;
  updatePlaybackState: (state: Partial<PlaybackState>) => void;
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
  // Removed render loop log
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    time: 0,
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
  const channelRef = useRef<any>(null);
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
      setPlaybackState((prev) => ({
        ...prev,
        time: event.time,
        isPlaying: event.type === "play",
      }));
      console.log("🎯 applySyncToPlayer called:", {
        streamId,
        event,
        hasPlayer: !!player,
        userId,
      });

      if (!player) {
        console.log("❌ No YouTube player available for sync");
        return;
      }

      try {
        const lagCompensation = calculateLagCompensation(event.timestamp);
        const adjustedTime = event.time + lagCompensation;

        console.log("⚡ Applying sync:", {
          eventType: event.type,
          originalTime: event.time,
          lagCompensation,
          adjustedTime,
        });

        switch (event.type) {
          case "play":
            await player.seekTo(adjustedTime, true);
            player.playVideo();
            console.log("▶️ Player started");
            break;
          case "pause":
            await player.seekTo(adjustedTime, true);
            player.pauseVideo();
            console.log("⏸️ Player paused");
            break;
          case "seek":
            await player.seekTo(adjustedTime, true);
            console.log("⏩ Player seeked");
            break;
        }

        setPlaybackState((prev) => ({
          ...prev,
          time: adjustedTime,
          isPlaying: event.type === "play",
        }));

        setLastSyncAt(new Date());
        setSyncStatus("connected");
        setError(null);
        console.log("✅ Sync applied successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown YouTube API error";
        console.error("❌ Error applying sync:", err);
        setError(errorMessage);
        setSyncStatus("error");
      }
    },
    [getYouTubePlayer, calculateLagCompensation, streamId, userId]
  );

  // Set up real-time subscription
  useEffect(() => {
    console.log("🔌 Setting up real-time subscription:", {
      streamId,
      userId,
      isHost,
    });

    const channel = supabase.channel(`stream:${streamId}:playback`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "playback_sync" }, (payload) => {
        console.log("📢 Received broadcast event:", {
          streamId,
          isHost,
          payload: payload.payload,
          userId,
        });

        if (!isHost && payload.payload) {
          console.log("🎯 Processing broadcast sync for participant");
          const playbackEvent: PlaybackEvent = {
            type: payload.payload.type,
            timestamp: payload.payload.timestamp,
            time: payload.payload.time,
            hostUserId: payload.payload.hostUserId,
            eventId: payload.payload.eventId,
          };
          processIncomingEvent(playbackEvent);
        }
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "streams",
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          console.log("📨 Received real-time update:", {
            streamId,
            isHost,
            payload: payload.new,
            userId,
          });

          // Handle incoming playback sync
          const newState = payload.new;
          if (newState && !isHost) {
            console.log("🔄 Processing incoming sync for participant");

            // Create a playback event from the database update
            const playbackEvent: PlaybackEvent = {
              type: newState.is_playing ? "play" : "pause",
              timestamp: Date.now(),
              time: newState.time || 0,
              hostUserId: "database-sync",
              eventId: `db-sync-${Date.now()}`,
            };

            console.log("🎯 Applying sync from database:", playbackEvent);
            processIncomingEvent(playbackEvent);
          } else if (isHost) {
            console.log("⏭️ Skipping sync - user is host");
          }
        }
      )
      .subscribe((status, err) => {
        console.log("📡 Subscription status changed:", {
          streamId,
          userId,
          isHost,
          status,
          error: err,
        });

        if (status === "SUBSCRIBED") {
          console.log("✅ Successfully subscribed to real-time updates");
          setIsConnected(true);
          setSyncStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          console.log("❌ Channel error - connection failed:", err);
          setIsConnected(false);
          setSyncStatus("error");
          setError(`Subscription error: ${err?.message || "Unknown error"}`);
        } else if (status === "TIMED_OUT") {
          console.log("⏰ Subscription timed out");
          setIsConnected(false);
          setSyncStatus("error");
          setError("Subscription timed out");
        } else if (status === "CLOSED") {
          console.log("🔒 Subscription closed");
          setIsConnected(false);
          setSyncStatus("disconnected");
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
  }, [streamId, isHost, playbackState, applySyncToPlayer]);

  // Enhanced broadcast method with debouncing
  const broadcastPlaybackEvent = useCallback(
    async (event: PlaybackEvent) => {
      console.log("📡 broadcastPlaybackEvent called");

      if (!isHost) {
        console.log("❌ Not broadcasting - user is not host");
        return;
      }

      // Debounce rapid events
      try {
        console.log("🚀 Broadcasting to database:");
        console.log({
          streamId,
          time: event.time,
          isPlaying: event.type === "play",
          eventType: event.type,
        });

        setSyncStatus("syncing");

        const result = await supabase
          .from("streams")
          .update({
            time: event.time,
            is_playing: event.type === "play",
            last_sync_at: new Date().toISOString(),
          })
          .eq("id", streamId)
          .select();

        console.log("✅ Database update result:", result);

        // Also broadcast the event directly to participants
        if (channelRef.current) {
          console.log("📢 Broadcasting event directly to participants");
          channelRef.current.send({
            type: "broadcast",
            event: "playback_sync",
            payload: {
              type: event.type,
              time: event.time,
              timestamp: event.timestamp,
              hostUserId: event.hostUserId,
              eventId: event.eventId,
            },
          });
        }

        setLastSyncAt(new Date());
        setSyncStatus("connected");
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Broadcast failed";
        console.error("❌ Error broadcasting playback event:", err);
        setError(errorMessage);
        setSyncStatus("error");
      }
    },
    [isHost, streamId]
  );

  // Process incoming sync events
  const processIncomingEvent = useCallback(
    async (event: PlaybackEvent) => {
      console.log("📥 processIncomingEvent called:", {
        streamId,
        isHost,
        event,
        userId,
        isDuplicate: processedEventsRef.current.has(event.eventId),
      });

      // Prevent processing duplicate events
      if (processedEventsRef.current.has(event.eventId)) {
        console.log("⏭️ Skipping duplicate event:", event.eventId);
        return;
      }
      processedEventsRef.current.add(event.eventId);

      // Clean up old processed events (keep last 100)
      if (processedEventsRef.current.size > 100) {
        const eventsArray = Array.from(processedEventsRef.current);
        processedEventsRef.current = new Set(eventsArray.slice(-50));
      }

      console.log("🎯 Applying sync to player:", event);
      await applySyncToPlayer(event);
    },
    [isHost, applySyncToPlayer, streamId, userId]
  );

  // Request sync from host
  const requestSync = useCallback(async () => {
    if (isHost) return;

    const syncRequestEvent: PlaybackEvent = {
      type: "sync_request",
      timestamp: Date.now(),
      time: 0,
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
      const time = player.getCurrentTime();
      const isPlaying = player.getPlayerState() === YT_PLAYER_STATE.PLAYING;

      const forceSyncEvent: PlaybackEvent = {
        type: isPlaying ? "play" : "pause",
        timestamp: Date.now(),
        time,
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
  const startPlayback = useCallback(() => {
    const player = getYouTubePlayer();

    console.log("🚀 startPlayback called:", {
      streamId,
      userId,
      isHost,
      hasPlayer: !!player,
    });

    if (!player) {
      console.log("❌ No YouTube player available for startPlayback");
      return;
    }

    try {
      console.log("▶️ Calling player.playVideo()");
      player.playVideo();
      console.log("✅ playVideo() called successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "startPlayback failed";
      console.error("❌ Error in startPlayback:", err);
      setError(errorMessage);
    }
  }, [getYouTubePlayer, streamId, userId, isHost]);

  // Update playback state (for host to sync with their own actions)
  const updatePlaybackState = useCallback((state: Partial<PlaybackState>) => {
    console.log("🔄 Updating playback state:", state);
    setPlaybackState((prev) => ({
      ...prev,
      ...state,
    }));
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    if (syncStatus === "error") {
      setSyncStatus("disconnected");
    }
  }, [syncStatus]);

  const handleIncomingSync = useCallback(
    (incomingState: Partial<PlaybackState>, currentState: PlaybackState) => {
      console.log("Incoming Sync!");
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
    startPlayback,
    updatePlaybackState,
  };
}
