import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamVideoPlayer } from "../StreamVideoPlayer";
import type { StreamMedia } from "../../domain/stream.types";

// Create a mock function that we can control
const mockUsePlaybackSync = vi.hoisted(() => vi.fn());

// Mock the hooks and services
vi.mock("../../hooks/use-playback-sync", () => ({
  usePlaybackSync: mockUsePlaybackSync,
}));

vi.mock("react-youtube", () => ({
  default: vi.fn(({ onReady, onStateChange, onError }) => (
    <div data-testid="youtube-player" />
  )),
}));

describe("StreamVideoPlayer - Enhanced Sync Integration", () => {
  const mockMedia: StreamMedia = {
    tmdb_id: 123,
    media_type: "movie",
    media_title: "Test Movie",
    poster_path: "/test.jpg",
    runtime: 120,
  };

  const defaultProps = {
    streamId: "test-stream-id",
    media: mockMedia,
    isHost: true,
    currentUserId: "test-user-id",
    videos: ["test-video-id"],
  };

  const defaultMockReturn = {
    playbackState: {
      currentTime: 0,
      isPlaying: false,
      duration: 0,
      volume: 1,
      isFullscreen: false,
    },
    syncStatus: "connected" as const,
    isConnected: true,
    connectionQuality: "good" as const,
    lastSyncAt: new Date(),
    error: null,
    broadcastPlaybackEvent: vi.fn(),
    processIncomingEvent: vi.fn(),
    requestSync: vi.fn(),
    forceSync: vi.fn(),
    clearError: vi.fn(),
    broadcastPlaybackState: vi.fn(),
    handleIncomingSync: vi.fn(),
    setConnectionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlaybackSync.mockReturnValue(defaultMockReturn);
  });

  describe("YouTube Player Integration", () => {
    it("should render YouTube player with correct video ID", () => {
      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("youtube-player")).toBeInTheDocument();
    });

    it("should initialize playback sync with YouTube player ref", () => {
      render(<StreamVideoPlayer {...defaultProps} />);

      expect(mockUsePlaybackSync).toHaveBeenCalledWith(
        expect.objectContaining({
          streamId: "test-stream-id",
          userId: "test-user-id",
          isHost: true,
          youtubePlayerRef: expect.any(Object),
        })
      );
    });
  });

  describe("Host vs Participant Controls", () => {
    it("should show host controls when user is host", () => {
      render(<StreamVideoPlayer {...defaultProps} isHost={true} />);

      // Host should not see "View Only" indicator
      expect(screen.queryByText("View Only")).not.toBeInTheDocument();
    });

    it("should show participant restrictions when user is not host", () => {
      render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

      // Participant should see "View Only" indicator
      expect(screen.getByText("View Only")).toBeInTheDocument();
    });
  });

  describe("Sync Status Indicators", () => {
    it("should show connected status when sync is active", () => {
      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Connected")).toBeInTheDocument();
      expect(screen.getByTestId("wifi-icon")).toBeInTheDocument();
    });

    it("should show connection lost status when disconnected", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        isConnected: false,
        syncStatus: "disconnected",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Connection Lost")).toBeInTheDocument();
      expect(screen.getByTestId("wifi-off-icon")).toBeInTheDocument();
    });

    it("should show syncing status during sync operations", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        syncStatus: "syncing",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Syncing...")).toBeInTheDocument();
    });

    it("should show error status when sync fails", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        syncStatus: "error",
        error: "Sync failed",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Sync Error")).toBeInTheDocument();
    });
  });

  describe("Manual Sync Controls", () => {
    it("should show manual sync button for participants", () => {
      render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

      expect(screen.getByTestId("manual-sync-button")).toBeInTheDocument();
    });

    it("should not show manual sync button for hosts", () => {
      render(<StreamVideoPlayer {...defaultProps} isHost={true} />);

      expect(
        screen.queryByTestId("manual-sync-button")
      ).not.toBeInTheDocument();
    });

    it("should call requestSync when manual sync button is clicked", async () => {
      const mockRequestSync = vi.fn();
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        requestSync: mockRequestSync,
      });

      render(<StreamVideoPlayer {...defaultProps} isHost={false} />);

      const syncButton = screen.getByTestId("manual-sync-button");
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockRequestSync).toHaveBeenCalled();
      });
    });

    it("should show force sync button when there are sync errors", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        error: "Sync failed",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("force-sync-button")).toBeInTheDocument();
    });

    it("should call forceSync when force sync button is clicked", async () => {
      const mockForceSync = vi.fn();
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        error: "Sync failed",
        forceSync: mockForceSync,
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      const forceSyncButton = screen.getByTestId("force-sync-button");
      fireEvent.click(forceSyncButton);

      await waitFor(() => {
        expect(mockForceSync).toHaveBeenCalled();
      });
    });
  });

  describe("Connection Quality Indicators", () => {
    it("should show good connection quality indicator", () => {
      render(<StreamVideoPlayer {...defaultProps} />);

      // Should show green connected indicator for good connection
      const connectedIndicator = screen.getByText("Connected");
      expect(connectedIndicator).toHaveClass("bg-green-600");
    });

    it("should show poor connection quality warning", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        connectionQuality: "poor",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Poor Connection")).toBeInTheDocument();
    });

    it("should show unstable connection warning", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        connectionQuality: "unstable",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Unstable Connection")).toBeInTheDocument();
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should display error message when sync fails", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        error: "Network connection failed",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("Network connection failed")).toBeInTheDocument();
    });

    it("should provide retry button when there are errors", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        error: "Sync failed",
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    it("should call clearError when retry button is clicked", async () => {
      const mockClearError = vi.fn();
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        error: "Sync failed",
        clearError: mockClearError,
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      const retryButton = screen.getByTestId("retry-button");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });
  });

  describe("Playback State Display", () => {
    it("should display current playback time", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        playbackState: {
          ...defaultMockReturn.playbackState,
          currentTime: 120,
          duration: 300,
        },
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByText("2:00 / 5:00")).toBeInTheDocument();
    });

    it("should show playing indicator when video is playing", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        playbackState: {
          ...defaultMockReturn.playbackState,
          isPlaying: true,
        },
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("playing-indicator")).toBeInTheDocument();
    });

    it("should show paused indicator when video is paused", () => {
      mockUsePlaybackSync.mockReturnValue({
        ...defaultMockReturn,
        playbackState: {
          ...defaultMockReturn.playbackState,
          isPlaying: false,
        },
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      expect(screen.getByTestId("paused-indicator")).toBeInTheDocument();
    });
  });

  describe("Mobile Responsiveness", () => {
    it("should apply mobile-optimized class on small screens", () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      const container = screen.getByTestId("video-player-container");
      expect(container).toHaveClass("mobile-optimized");
    });

    it("should not apply mobile-optimized class on desktop", () => {
      // Mock window.innerWidth for desktop
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<StreamVideoPlayer {...defaultProps} />);

      const container = screen.getByTestId("video-player-container");
      expect(container).not.toHaveClass("mobile-optimized");
    });
  });
});
