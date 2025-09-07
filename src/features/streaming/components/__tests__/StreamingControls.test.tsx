import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamingControls } from "../StreamingControls";

const mockOnPlay = vi.fn();
const mockOnPause = vi.fn();
const mockOnSeek = vi.fn();
const mockOnVolumeChange = vi.fn();
const mockOnSpeedChange = vi.fn();

const defaultProps = {
  isPlaying: false,
  currentTime: 0,
  duration: 100,
  volume: 1,
  playbackSpeed: 1,
  isCreator: true,
  loading: false,
  onPlay: mockOnPlay,
  onPause: mockOnPause,
  onSeek: mockOnSeek,
  onVolumeChange: mockOnVolumeChange,
  onSpeedChange: mockOnSpeedChange,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("StreamingControls", () => {
  it("should render play/pause button for creator", () => {
    render(<StreamingControls {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: "Play" });
    expect(playButton).toBeInTheDocument();
  });

  it("should not render play/pause button for non-creator", () => {
    render(<StreamingControls {...defaultProps} isCreator={false} />);

    const playButton = screen.queryByRole("button", { name: "Play" });
    expect(playButton).not.toBeInTheDocument();
  });

  it("should call onPlay when play button is clicked", () => {
    render(<StreamingControls {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: "Play" });
    fireEvent.click(playButton);

    expect(mockOnPlay).toHaveBeenCalled();
  });

  it("should call onPause when pause button is clicked", () => {
    render(<StreamingControls {...defaultProps} isPlaying={true} />);

    const pauseButton = screen.getByRole("button", { name: "Pause" });
    fireEvent.click(pauseButton);

    expect(mockOnPause).toHaveBeenCalled();
  });

  it("should render seek controls", () => {
    render(<StreamingControls {...defaultProps} />);

    const seekSlider = screen.getByRole("slider", { name: /seek/i });
    expect(seekSlider).toBeInTheDocument();
  });

  it("should call onSeek when seek slider is changed", () => {
    render(<StreamingControls {...defaultProps} />);

    const seekSlider = screen.getByRole("slider", { name: /seek/i });
    fireEvent.change(seekSlider, { target: { value: "50" } });

    expect(mockOnSeek).toHaveBeenCalledWith(50);
  });

  it("should render volume controls", () => {
    render(<StreamingControls {...defaultProps} />);

    const volumeSlider = screen.getByRole("slider", { name: /volume/i });
    expect(volumeSlider).toBeInTheDocument();
  });

  it("should call onVolumeChange when volume slider is changed", () => {
    render(<StreamingControls {...defaultProps} />);

    const volumeSlider = screen.getByRole("slider", { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: "0.5" } });

    expect(mockOnVolumeChange).toHaveBeenCalledWith(0.5);
  });

  it("should render playback speed controls", () => {
    render(<StreamingControls {...defaultProps} />);

    const speedButton = screen.getByRole("button", {
      name: "Playback speed settings",
    });
    expect(speedButton).toBeInTheDocument();
  });

  it("should show speed options when speed button is clicked", () => {
    render(<StreamingControls {...defaultProps} />);

    const speedButton = screen.getByRole("button", {
      name: "Playback speed settings",
    });
    fireEvent.click(speedButton);

    expect(screen.getByText("0.5x")).toBeInTheDocument();
    expect(screen.getAllByText("1x")).toHaveLength(2); // One in button, one in dropdown
    expect(screen.getByText("1.25x")).toBeInTheDocument();
    expect(screen.getByText("1.5x")).toBeInTheDocument();
    expect(screen.getByText("2x")).toBeInTheDocument();
  });

  it("should call onSpeedChange when speed option is selected", () => {
    render(<StreamingControls {...defaultProps} />);

    const speedButton = screen.getByRole("button", {
      name: "Playback speed settings",
    });
    fireEvent.click(speedButton);

    const speed125Button = screen.getByText("1.25x");
    fireEvent.click(speed125Button);

    expect(mockOnSpeedChange).toHaveBeenCalledWith(1.25);
  });

  it("should display current time and duration", () => {
    render(
      <StreamingControls {...defaultProps} currentTime={30} duration={120} />
    );

    expect(screen.getByText("0:30")).toBeInTheDocument();
    expect(screen.getByText("2:00")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    render(<StreamingControls {...defaultProps} loading={true} />);

    const playButton = screen.getByRole("button", { name: "Play" });
    expect(playButton).toBeDisabled();
  });

  it("should disable controls when loading", () => {
    render(<StreamingControls {...defaultProps} loading={true} />);

    const seekSlider = screen.getByRole("slider", { name: /seek/i });
    const volumeSlider = screen.getByRole("slider", { name: /volume/i });

    expect(seekSlider).toBeDisabled();
    expect(volumeSlider).toBeDisabled();
  });

  it("should show creator-only indicator for non-creators", () => {
    render(<StreamingControls {...defaultProps} isCreator={false} />);

    expect(
      screen.getByText(/only the session creator can control playback/i)
    ).toBeInTheDocument();
  });

  it("should be accessible with proper ARIA labels", () => {
    render(<StreamingControls {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: "Play" });
    const seekSlider = screen.getByRole("slider", { name: /seek/i });
    const volumeSlider = screen.getByRole("slider", { name: /volume/i });

    expect(playButton).toHaveAttribute("aria-label");
    expect(seekSlider).toHaveAttribute("aria-label");
    expect(volumeSlider).toHaveAttribute("aria-label");
  });

  it("should handle keyboard shortcuts", () => {
    render(<StreamingControls {...defaultProps} />);

    const container = screen.getByRole("region", {
      name: /streaming controls/i,
    });

    // Test spacebar for play/pause
    fireEvent.keyDown(container, { key: " ", code: "Space" });
    expect(mockOnPlay).toHaveBeenCalled();
  });

  it("should sync controls across participants", async () => {
    const { rerender } = render(<StreamingControls {...defaultProps} />);

    // Simulate external state change (from synchronization)
    rerender(
      <StreamingControls {...defaultProps} isPlaying={true} currentTime={25} />
    );

    await waitFor(() => {
      const seekSlider = screen.getByRole("slider", { name: /seek/i });
      expect(seekSlider).toHaveValue("25");
    });
  });
});
