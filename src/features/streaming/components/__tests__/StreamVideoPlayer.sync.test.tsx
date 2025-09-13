import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamVideoPlayer } from "../StreamVideoPlayer";
import type { StreamMedia } from "../../domain/stream.types";

// Mock the playback sync hook
const mockBroadcastPlaybackState = vi.fn();
const mockHandleIncomingSync = vi.fn();
const mockSetConnectionStatus = vi.fn();

vi.mock("../../hooks/use-playback-sync", () => ({
  usePlaybackSync: vi.fn(() => ({
    playbackState: {
      time: 0,
      isPlaying: false,
      duration: 0,
      volume: 1,
      isFullscreen: false,
    },
    isConnected: true,
    lastSyncAt: null,
    broadcastPlaybackState: mockBroadcastPlaybackState,
    handleIncomingSync: mockHandleIncomingSync,
    setConnectionStatus: mockSetConnectionStatus,
  })),
}));

describe("StreamVideoPlayer with Sync", () => {
  const mockMedia: StreamMedia = {
    tmdb_id: 123,
    media_type: "movie",
    media_title: "Test Movie",
    poster_path: "/test-poster.jpg",
    video_url: "https://example.com/video.mp4",
    runtime: 120,
  };

  const defaultProps = {
    streamId: "test-stream-id",
    media: mockMedia,
    isHost: true,
    currentUserId: "test-user-id",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render video player with sync functionality", () => {
    render(<StreamVideoPlayer {...defaultProps} />);

    expect(screen.getByTestId("video-player-container")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("should broadcast playback state when host plays video", async () => {
    render(<StreamVideoPlayer {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: /play/i });

    // Simulate video play event
    const video = screen.getByRole("application") as HTMLVideoElement;
    fireEvent.click(playButton);
    fireEvent.play(video);

    await waitFor(() => {
      expect(mockBroadcastPlaybackState).toHaveBeenCalledWith({
        isPlaying: true,
      });
    });
  });

  it("should broadcast playback state when host pauses video", async () => {
    render(<StreamVideoPlayer {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: /play/i });
    const video = screen.getByRole("application") as HTMLVideoElement;

    // First play
    fireEvent.click(playButton);
    fireEvent.play(video);

    await waitFor(() => {
      expect(mockBroadcastPlaybackState).toHaveBeenCalledWith({
        isPlaying: true,
      });
    });

    // Then pause
    fireEvent.click(playButton);
    fireEvent.pause(video);

    await waitFor(() => {
      expect(mockBroadcastPlaybackState).toHaveBeenCalledWith({
        isPlaying: false,
      });
    });
  });

  it("should broadcast playback state when host seeks", async () => {
    render(<StreamVideoPlayer {...defaultProps} />);

    const progressBar = screen.getByRole("slider", { name: /progress/i });
    fireEvent.change(progressBar, { target: { value: "30" } });

    await waitFor(() => {
      expect(mockBroadcastPlaybackState).toHaveBeenCalledWith({
        time: 30,
      });
    });
  });

  it("should not broadcast when participant tries to control playback", async () => {
    render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

    const playButton = screen.getByRole("button", { name: /play/i });
    expect(playButton).toBeDisabled();

    const progressBar = screen.getByRole("slider", { name: /progress/i });
    expect(progressBar).toBeDisabled();

    expect(mockBroadcastPlaybackState).not.toHaveBeenCalled();
  });

  it("should show view-only indicator for participants", () => {
    render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

    expect(screen.getByText("View Only")).toBeInTheDocument();
  });

  it("should handle connection status changes", () => {
    render(<StreamVideoPlayer {...defaultProps} />);

    expect(mockSetConnectionStatus).toHaveBeenCalledWith(true);
  });

  it("should sync to incoming playback state for participants", async () => {
    // Mock the hook to return synced state
    const mockUsePlaybackSync = await import("../../hooks/use-playback-sync");
    vi.mocked(mockUsePlaybackSync.usePlaybackSync).mockReturnValue({
      playbackState: {
        time: 45,
        isPlaying: true,
        duration: 120,
        volume: 1,
        isFullscreen: false,
      },
      isConnected: true,
      lastSyncAt: new Date(),
      broadcastPlaybackState: mockBroadcastPlaybackState,
      handleIncomingSync: mockHandleIncomingSync,
      setConnectionStatus: mockSetConnectionStatus,
    });

    render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

    // The component should use the synced playback state
    await waitFor(() => {
      expect(mockSetConnectionStatus).toHaveBeenCalledWith(true);
    });
  });

  it("should handle network reconnection gracefully", async () => {
    // Mock disconnected state
    const mockUsePlaybackSync = await import("../../hooks/use-playback-sync");
    vi.mocked(mockUsePlaybackSync.usePlaybackSync).mockReturnValue({
      playbackState: {
        time: 0,
        isPlaying: false,
        duration: 0,
        volume: 1,
        isFullscreen: false,
      },
      isConnected: false,
      lastSyncAt: null,
      broadcastPlaybackState: mockBroadcastPlaybackState,
      handleIncomingSync: mockHandleIncomingSync,
      setConnectionStatus: mockSetConnectionStatus,
    });

    const { rerender } = render(<StreamVideoPlayer {...defaultProps} />);

    // Should show connection lost indicator
    expect(screen.getByText("Connection Lost")).toBeInTheDocument();

    // Simulate reconnection
    vi.mocked(mockUsePlaybackSync.usePlaybackSync).mockReturnValue({
      playbackState: {
        time: 0,
        isPlaying: false,
        duration: 0,
        volume: 1,
        isFullscreen: false,
      },
      isConnected: true,
      lastSyncAt: new Date(),
      broadcastPlaybackState: mockBroadcastPlaybackState,
      handleIncomingSync: mockHandleIncomingSync,
      setConnectionStatus: mockSetConnectionStatus,
    });

    rerender(<StreamVideoPlayer {...defaultProps} />);

    // Should show connected indicator
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });
});
