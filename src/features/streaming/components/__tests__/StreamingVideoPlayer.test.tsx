import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamingVideoPlayer } from "../StreamingVideoPlayer";

// Mock HTMLVideoElement methods
const mockPlay = vi.fn();
const mockPause = vi.fn();
const mockRequestFullscreen = vi.fn();
const mockRequestPictureInPicture = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock video element methods
  Object.defineProperty(HTMLVideoElement.prototype, "play", {
    writable: true,
    value: mockPlay.mockResolvedValue(undefined),
  });

  Object.defineProperty(HTMLVideoElement.prototype, "pause", {
    writable: true,
    value: mockPause,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "requestFullscreen", {
    writable: true,
    value: mockRequestFullscreen.mockResolvedValue(undefined),
  });

  Object.defineProperty(HTMLVideoElement.prototype, "requestPictureInPicture", {
    writable: true,
    value: mockRequestPictureInPicture.mockResolvedValue({}),
  });

  // Mock video properties
  Object.defineProperty(HTMLVideoElement.prototype, "duration", {
    writable: true,
    value: 100,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "currentTime", {
    writable: true,
    value: 0,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "volume", {
    writable: true,
    value: 1,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "paused", {
    writable: true,
    value: true,
  });
});

describe("StreamingVideoPlayer", () => {
  const defaultProps = {
    src: "https://example.com/video.mp4",
    title: "Test Video",
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onSeek: vi.fn(),
    onVolumeChange: vi.fn(),
  };

  it("should render video element with correct src", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const container = screen.getByRole("application", {
      name: /video player/i,
    });
    expect(container).toBeInTheDocument();

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute("src", defaultProps.src);
  });

  it("should render play/pause button", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const playButtons = screen.getAllByRole("button", { name: /play/i });
    expect(playButtons.length).toBeGreaterThan(0);
  });

  it("should call onPlay when play button is clicked", async () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: "Play video" });
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
      expect(defaultProps.onPlay).toHaveBeenCalled();
    });
  });

  it("should render volume control", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const volumeSlider = screen.getByRole("slider", { name: /volume/i });
    expect(volumeSlider).toBeInTheDocument();
  });

  it("should render seek bar", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const seekSlider = screen.getByRole("slider", { name: /seek/i });
    expect(seekSlider).toBeInTheDocument();
  });

  it("should render fullscreen button", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const fullscreenButton = screen.getByRole("button", {
      name: /fullscreen/i,
    });
    expect(fullscreenButton).toBeInTheDocument();
  });

  it("should render picture-in-picture button", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const pipButton = screen.getByRole("button", {
      name: /picture.in.picture/i,
    });
    expect(pipButton).toBeInTheDocument();
  });

  it("should handle keyboard shortcuts", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const container = screen.getByRole("application", {
      name: /video player/i,
    });

    // Test spacebar for play/pause
    fireEvent.keyDown(container, { key: " ", code: "Space" });
    expect(mockPlay).toHaveBeenCalled();
  });

  it("should show loading state", () => {
    render(<StreamingVideoPlayer {...defaultProps} loading />);

    const loadingIndicator = screen.getByText(/loading/i);
    expect(loadingIndicator).toBeInTheDocument();
  });

  it("should show error state", () => {
    const errorMessage = "Failed to load video";
    render(<StreamingVideoPlayer {...defaultProps} error={errorMessage} />);

    const errorText = screen.getByText(errorMessage);
    expect(errorText).toBeInTheDocument();
  });

  it("should handle quality selection", () => {
    const qualities = [
      { label: "720p", src: "https://example.com/720p.mp4" },
      { label: "1080p", src: "https://example.com/1080p.mp4" },
    ];

    render(<StreamingVideoPlayer {...defaultProps} qualities={qualities} />);

    const qualityButton = screen.getByRole("button", { name: /quality/i });
    expect(qualityButton).toBeInTheDocument();
  });

  it("should be accessible with proper ARIA labels", () => {
    render(<StreamingVideoPlayer {...defaultProps} />);

    const video = screen.getByRole("application", { name: /video player/i });
    expect(video).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Test Video")
    );

    const playButton = screen.getByRole("button", { name: "Play video" });
    expect(playButton).toHaveAttribute("aria-label");
  });
});
