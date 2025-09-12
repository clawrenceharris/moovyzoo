import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlaybackState } from "../../domain/stream.types";

// Mock YouTube Player API types
interface MockYouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  getDuration: () => number;
  addEventListener: (event: string, listener: (event: any) => void) => void;
  removeEventListener: (event: string, listener: (event: any) => void) => void;
}

// YouTube Player States
const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn().mockReturnThis(),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  from: vi.fn(() => ({
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
};

vi.mock("@/utils/supabase/client", () => ({
  supabase: mockSupabase,
}));

const { usePlaybackSync } = await import("../use-playback-sync");

describe("usePlaybackSync", () => {
  const mockStreamId = "test-stream-id";
  const mockUserId = "test-user-id";
  const mockIsHost = true;

  let mockYouTubePlayer: MockYouTubePlayer;
  let mockYouTubePlayerRef: { current: MockYouTubePlayer | null };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock YouTube player
    mockYouTubePlayer = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
      getCurrentTime: vi.fn(() => 0),
      getPlayerState: vi.fn(() => YT_PLAYER_STATE.PAUSED),
      getDuration: vi.fn(() => 120),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    mockYouTubePlayerRef = { current: mockYouTubePlayer };
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should initialize with default playback state", () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: mockIsHost,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    expect(result.current.playbackState).toEqual({
      currentTime: 0,
      isPlaying: false,
      duration: 0,
      volume: 1,
      isFullscreen: false,
    });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.lastSyncAt).toBeNull();
  });

  it("should create realtime subscription on mount", () => {
    renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: mockIsHost,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    expect(mockSupabase.channel).toHaveBeenCalledWith(
      `stream:${mockStreamId}:playback`
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      expect.objectContaining({
        event: "UPDATE",
        schema: "public",
        table: "streams",
        filter: `id=eq.${mockStreamId}`,
      }),
      expect.any(Function)
    );
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it("should broadcast playback state when host makes changes", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: true,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    const newState: Partial<PlaybackState> = {
      currentTime: 30,
      isPlaying: true,
    };

    await act(async () => {
      await result.current.broadcastPlaybackState(newState);

      // Fast-forward debounce timer
      vi.advanceTimersByTime(300);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("streams");

    vi.useRealTimers();
  });

  it("should not broadcast playback state when user is not host", async () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: false,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    const newState: Partial<PlaybackState> = {
      currentTime: 30,
      isPlaying: true,
    };

    await act(async () => {
      await result.current.broadcastPlaybackState(newState);
    });

    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("should handle sync tolerance to prevent micro-adjustments", () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: false,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    // First set the initial state
    const initialState: PlaybackState = {
      currentTime: 30.0,
      isPlaying: true,
      duration: 120,
      volume: 1,
      isFullscreen: false,
    };

    act(() => {
      result.current.handleIncomingSync(
        initialState,
        result.current.playbackState
      );
    });

    const incomingState = {
      currentTime: 30.2, // Within tolerance (0.5s)
      isPlaying: true,
    };

    act(() => {
      result.current.handleIncomingSync(
        incomingState,
        result.current.playbackState
      );
    });

    // Should not update due to sync tolerance
    expect(result.current.playbackState.currentTime).toBe(30.0);
  });

  it("should sync when difference exceeds tolerance", () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: false,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    const currentState: PlaybackState = {
      currentTime: 30.0,
      isPlaying: true,
      duration: 120,
      volume: 1,
      isFullscreen: false,
    };

    const incomingState = {
      currentTime: 31.0, // Exceeds tolerance (0.5s)
      isPlaying: true,
    };

    act(() => {
      result.current.handleIncomingSync(incomingState, currentState);
    });

    expect(result.current.playbackState.currentTime).toBe(31.0);
  });

  it("should handle connection status changes", () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: mockIsHost,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    act(() => {
      result.current.setConnectionStatus(true);
    });

    expect(result.current.isConnected).toBe(true);
  });

  it("should cleanup subscription on unmount", () => {
    const { unmount } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: mockIsHost,
        youtubePlayerRef: mockYouTubePlayerRef,
      })
    );

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });

  describe("YouTube Player Integration", () => {
    it("should initialize with YouTube player reference", () => {
      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: mockIsHost,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      expect(result.current.playbackState).toBeDefined();
      expect(result.current.syncStatus).toBe("disconnected");
    });

    it("should broadcast play event when host plays video", async () => {
      vi.useFakeTimers();

      mockYouTubePlayer.getCurrentTime = vi.fn(() => 30);
      mockYouTubePlayer.getPlayerState = vi.fn(() => YT_PLAYER_STATE.PLAYING);

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: true,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      await act(async () => {
        await result.current.broadcastPlaybackEvent({
          type: "play",
          timestamp: Date.now(),
          currentTime: 30,
          hostUserId: mockUserId,
          eventId: "test-event-1",
        });

        // Fast-forward debounce timer
        vi.advanceTimersByTime(300);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("streams");

      vi.useRealTimers();
    });

    it("should broadcast pause event when host pauses video", async () => {
      vi.useFakeTimers();

      mockYouTubePlayer.getCurrentTime = vi.fn(() => 45);
      mockYouTubePlayer.getPlayerState = vi.fn(() => YT_PLAYER_STATE.PAUSED);

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: true,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      await act(async () => {
        await result.current.broadcastPlaybackEvent({
          type: "pause",
          timestamp: Date.now(),
          currentTime: 45,
          hostUserId: mockUserId,
          eventId: "test-event-2",
        });

        // Fast-forward debounce timer
        vi.advanceTimersByTime(300);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("streams");

      vi.useRealTimers();
    });

    it("should broadcast seek event when host seeks video", async () => {
      vi.useFakeTimers();

      mockYouTubePlayer.getCurrentTime = vi.fn(() => 60);

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: true,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      await act(async () => {
        await result.current.broadcastPlaybackEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 60,
          hostUserId: mockUserId,
          eventId: "test-event-3",
          metadata: { seekFrom: 30 },
        });

        // Fast-forward debounce timer
        vi.advanceTimersByTime(300);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("streams");

      vi.useRealTimers();
    });

    it("should not broadcast events when user is not host", async () => {
      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: false,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      await act(async () => {
        await result.current.broadcastPlaybackEvent({
          type: "play",
          timestamp: Date.now(),
          currentTime: 30,
          hostUserId: mockUserId,
          eventId: "test-event-4",
        });
      });

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should apply sync events to YouTube player for participants", async () => {
      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: false,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      const playEvent = {
        type: "play" as const,
        timestamp: Date.now(),
        currentTime: 30,
        hostUserId: "host-user-id",
        eventId: "sync-event-1",
      };

      await act(async () => {
        await result.current.processIncomingEvent(playEvent);
      });

      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(30, true);
      expect(mockYouTubePlayer.playVideo).toHaveBeenCalled();
    });

    it("should handle seek events with lag compensation", async () => {
      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: false,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      const seekEvent = {
        type: "seek" as const,
        timestamp: Date.now() - 200, // 200ms ago
        currentTime: 60,
        hostUserId: "host-user-id",
        eventId: "sync-event-2",
        metadata: { seekFrom: 30 },
      };

      await act(async () => {
        await result.current.processIncomingEvent(seekEvent);
      });

      // Should compensate for network delay
      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(60.2, true);
    });

    it("should handle buffering states without breaking sync", async () => {
      mockYouTubePlayer.getPlayerState = vi.fn(() => YT_PLAYER_STATE.BUFFERING);

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: false,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      const playEvent = {
        type: "play" as const,
        timestamp: Date.now(),
        currentTime: 30,
        hostUserId: "host-user-id",
        eventId: "sync-event-3",
      };

      await act(async () => {
        await result.current.processIncomingEvent(playEvent);
      });

      // Should still attempt to sync even during buffering
      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(30, true);
    });

    it("should provide sync status and connection quality", () => {
      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: mockIsHost,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      expect(result.current.syncStatus).toBe("disconnected");
      expect(result.current.connectionQuality).toBe("good");
      expect(result.current.error).toBeNull();
    });

    it("should handle YouTube player errors gracefully", async () => {
      mockYouTubePlayer.playVideo = vi.fn(() => {
        throw new Error("YouTube API Error");
      });

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: false,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      const playEvent = {
        type: "play" as const,
        timestamp: Date.now(),
        currentTime: 30,
        hostUserId: "host-user-id",
        eventId: "sync-event-4",
      };

      await act(async () => {
        await result.current.processIncomingEvent(playEvent);
      });

      expect(result.current.error).toContain("YouTube API Error");
    });

    it("should debounce rapid broadcast events", async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        usePlaybackSync({
          streamId: mockStreamId,
          userId: mockUserId,
          isHost: true,
          youtubePlayerRef: mockYouTubePlayerRef,
        })
      );

      // Send multiple rapid events
      await act(async () => {
        await result.current.broadcastPlaybackEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 30,
          hostUserId: mockUserId,
          eventId: "rapid-1",
        });
        await result.current.broadcastPlaybackEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 31,
          hostUserId: mockUserId,
          eventId: "rapid-2",
        });
        await result.current.broadcastPlaybackEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 32,
          hostUserId: mockUserId,
          eventId: "rapid-3",
        });
      });

      // Fast-forward debounce timer
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only broadcast the last event due to debouncing
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });
  });
});
