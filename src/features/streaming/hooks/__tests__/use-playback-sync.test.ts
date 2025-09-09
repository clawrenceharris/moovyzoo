import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PlaybackState } from "../../domain/stream.types";

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

  beforeEach(() => {
    vi.clearAllMocks();
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
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: true,
      })
    );

    const newState: Partial<PlaybackState> = {
      currentTime: 30,
      isPlaying: true,
    };

    await act(async () => {
      await result.current.broadcastPlaybackState(newState);
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("streams");
  });

  it("should not broadcast playback state when user is not host", async () => {
    const { result } = renderHook(() =>
      usePlaybackSync({
        streamId: mockStreamId,
        userId: mockUserId,
        isHost: false,
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
      })
    );

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });
});
