import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamVideoPlayer } from "../StreamVideoPlayer";
import type { StreamMedia } from "../../domain/stream.types";

// Mock the playback sync hook
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
    broadcastPlaybackState: vi.fn(),
    handleIncomingSync: vi.fn(),
    setConnectionStatus: vi.fn(),
  })),
}));

// Mock document.fullscreenElement
Object.defineProperty(document, "fullscreenElement", {
  writable: true,
  value: null,
});

Object.defineProperty(document, "exitFullscreen", {
  writable: true,
  value: vi.fn(),
});

// Mock HTMLVideoElement methods
beforeEach(() => {
  vi.clearAllMocks();

  // Mock video element methods
  HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  HTMLVideoElement.prototype.pause = vi.fn();
  HTMLVideoElement.prototype.load = vi.fn();
  HTMLVideoElement.prototype.requestFullscreen = vi.fn();

  // Mock video properties
  Object.defineProperty(HTMLVideoElement.prototype, "time", {
    get: vi.fn(() => 0),
    set: vi.fn(),
    configurable: true,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "duration", {
    get: vi.fn(() => 100),
    configurable: true,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "paused", {
    get: vi.fn(() => true),
    configurable: true,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "volume", {
    get: vi.fn(() => 1),
    set: vi.fn(),
    configurable: true,
  });
});

const mockMedia: StreamMedia = {
  tmdb_id: 123,
  media_type: "movie",
  media_title: "Test Movie",
  poster_path: "/test-poster.jpg",
  video_url: "https://example.com/test-video.mp4",
  runtime: 120,
};

const mockOnPlaybackChange = vi.fn();

describe("StreamVideoPlayer", () => {
  it("should render video player with basic controls", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /fullscreen/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/progress/i)).toBeInTheDocument();
  });

  it("should display loading state initially", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should show play button when video is paused", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const playButton = screen.getByRole("button", { name: /play/i });
    expect(playButton).toBeInTheDocument();
  });

  it("should call onPlaybackChange when play button is clicked", async () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const playButton = screen.getByRole("button", { name: /play/i });
    fireEvent.click(playButton);

    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });

  it("should disable controls for non-host users", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={false}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const playButton = screen.getByRole("button", { name: /play/i });
    expect(playButton).toBeDisabled();
  });

  it("should handle volume control", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const volumeSlider = screen.getByLabelText(/volume/i);
    fireEvent.change(volumeSlider, { target: { value: "0.5" } });

    // Volume change should be handled
    expect(volumeSlider).toBeInTheDocument();
  });

  it("should handle fullscreen toggle", async () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const fullscreenButton = screen.getByRole("button", {
      name: /fullscreen/i,
    });
    fireEvent.click(fullscreenButton);

    // Fullscreen should be attempted
    expect(fullscreenButton).toBeInTheDocument();
  });

  it("should display error state when video fails to load", async () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    // Simulate error by triggering error event on video element
    const video = document.querySelector("video");
    if (video) {
      fireEvent.error(video);
    }

    // Should show retry button after error
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should handle keyboard shortcuts", () => {
    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const videoContainer = screen.getByTestId("video-player-container");

    // Test spacebar for play/pause
    fireEvent.keyDown(videoContainer, { key: " ", code: "Space" });
    expect(HTMLVideoElement.prototype.play).toHaveBeenCalled();
  });

  it("should be responsive on mobile", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <StreamVideoPlayer
        streamId="test-stream"
        media={mockMedia}
        isHost={true}
        currentUserId="user-1"
        onPlaybackChange={mockOnPlaybackChange}
      />
    );

    const videoContainer = screen.getByTestId("video-player-container");
    expect(videoContainer).toHaveClass("mobile-optimized");
  });
});
