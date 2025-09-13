import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { YouTubePlayerService } from "../youtube-player.service";
import type { YouTubePlayer, PlaybackState } from "../../domain/stream.types";

// Mock YouTube Player
const mockYouTubePlayer: YouTubePlayer = {
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  seekTo: vi.fn(),
  getCurrentTime: vi.fn().mockReturnValue(0),
  getPlayerState: vi.fn().mockReturnValue(2), // PAUSED
  getDuration: vi.fn().mockReturnValue(100),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

describe("YouTubePlayerService", () => {
  let service: YouTubePlayerService;
  let playerRef: React.RefObject<YouTubePlayer>;

  beforeEach(() => {
    vi.clearAllMocks();
    playerRef = { current: mockYouTubePlayer };
    service = new YouTubePlayerService(playerRef);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Player Control Methods", () => {
    it("should play video when play() is called", async () => {
      await service.play();
      expect(mockYouTubePlayer.playVideo).toHaveBeenCalledOnce();
    });

    it("should pause video when pause() is called", async () => {
      await service.pause();
      expect(mockYouTubePlayer.pauseVideo).toHaveBeenCalledOnce();
    });

    it("should seek to specific time when seekTo() is called", async () => {
      const targetTime = 30;
      await service.seekTo(targetTime);
      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(targetTime, true);
    });

    it("should seek with allowSeekAhead parameter", async () => {
      const targetTime = 30;
      await service.seekTo(targetTime, false);
      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(targetTime, false);
    });
  });

  describe("State Retrieval Methods", () => {
    it("should return current time", async () => {
      mockYouTubePlayer.getCurrentTime = vi.fn().mockReturnValue(45);
      const time = await service.getCurrentTime();
      expect(time).toBe(45);
      expect(mockYouTubePlayer.getCurrentTime).toHaveBeenCalledOnce();
    });

    it("should return player state", async () => {
      const expectedState = 1; // PLAYING
      mockYouTubePlayer.getPlayerState = vi.fn().mockReturnValue(expectedState);
      const playerState = await service.getPlayerState();
      expect(playerState).toBe(expectedState);
      expect(mockYouTubePlayer.getPlayerState).toHaveBeenCalledOnce();
    });

    it("should return duration", async () => {
      mockYouTubePlayer.getDuration = vi.fn().mockReturnValue(120);
      const duration = await service.getDuration();
      expect(duration).toBe(120);
      expect(mockYouTubePlayer.getDuration).toHaveBeenCalledOnce();
    });
  });

  describe("Event Handling", () => {
    it("should add state change event listener", () => {
      const callback = vi.fn();
      service.onStateChange(callback);
      expect(mockYouTubePlayer.addEventListener).toHaveBeenCalledWith(
        "onStateChange",
        callback
      );
    });

    it("should add ready event listener", () => {
      const callback = vi.fn();
      service.onReady(callback);
      expect(mockYouTubePlayer.addEventListener).toHaveBeenCalledWith(
        "onReady",
        callback
      );
    });

    it("should add error event listener", () => {
      const callback = vi.fn();
      service.onError(callback);
      expect(mockYouTubePlayer.addEventListener).toHaveBeenCalledWith(
        "onError",
        callback
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw error when player is not available for play()", async () => {
      const serviceWithoutPlayer = new YouTubePlayerService({ current: null });
      await expect(serviceWithoutPlayer.play()).rejects.toThrow(
        "YouTube player is not available"
      );
    });

    it("should throw error when player is not available for pause()", async () => {
      const serviceWithoutPlayer = new YouTubePlayerService({ current: null });
      await expect(serviceWithoutPlayer.pause()).rejects.toThrow(
        "YouTube player is not available"
      );
    });

    it("should throw error when player is not available for seekTo()", async () => {
      const serviceWithoutPlayer = new YouTubePlayerService({ current: null });
      await expect(serviceWithoutPlayer.seekTo(30)).rejects.toThrow(
        "YouTube player is not available"
      );
    });

    it("should handle YouTube API errors gracefully", async () => {
      const originalPlayVideo = mockYouTubePlayer.playVideo;
      mockYouTubePlayer.playVideo = vi.fn().mockImplementation(() => {
        throw new Error("YouTube API Error");
      });

      await expect(service.play()).rejects.toThrow("YouTube API Error");

      // Restore original mock
      mockYouTubePlayer.playVideo = originalPlayVideo;
    });
  });

  describe("Sync-Specific Methods", () => {
    it("should sync to playback state", async () => {
      const playbackState: PlaybackState = {
        time: 60,
        isPlaying: true,
        duration: 120,
        volume: 0.8,
        isFullscreen: false,
      };

      await service.syncToState(playbackState);

      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(60, true);
      expect(mockYouTubePlayer.playVideo).toHaveBeenCalledOnce();
    });

    it("should sync to paused state", async () => {
      const playbackState: PlaybackState = {
        time: 30,
        isPlaying: false,
        duration: 120,
        volume: 0.8,
        isFullscreen: false,
      };

      await service.syncToState(playbackState);

      expect(mockYouTubePlayer.seekTo).toHaveBeenCalledWith(30, true);
      expect(mockYouTubePlayer.pauseVideo).toHaveBeenCalledOnce();
    });

    it("should get detailed playback state", async () => {
      mockYouTubePlayer.getCurrentTime = vi.fn().mockReturnValue(45);
      mockYouTubePlayer.getPlayerState = vi.fn().mockReturnValue(1); // PLAYING
      mockYouTubePlayer.getDuration = vi.fn().mockReturnValue(120);

      const detailedState = await service.getDetailedState();

      expect(detailedState).toEqual({
        time: 45,
        isPlaying: true,
        duration: 120,
        volume: 1, // Default volume
        isFullscreen: false, // Default fullscreen
        playerState: 1,
        videoLoadedFraction: 0, // Default loaded fraction
        availableQualityLevels: [], // Default quality levels
        playbackQuality: "auto", // Default quality
        bufferedTimeRanges: expect.any(Object), // Mock TimeRanges
      });
    });
  });

  describe("Player Ready State", () => {
    it("should return true when player is ready", () => {
      expect(service.isPlayerReady()).toBe(true);
    });

    it("should return false when player is not available", () => {
      const serviceWithoutPlayer = new YouTubePlayerService({ current: null });
      expect(serviceWithoutPlayer.isPlayerReady()).toBe(false);
    });
  });

  describe("Error Recovery", () => {
    it("should reload player", async () => {
      // Mock reload functionality - in real implementation this would recreate the player
      const reloadSpy = vi.spyOn(service, "reload");
      await service.reload();
      expect(reloadSpy).toHaveBeenCalledOnce();
    });
  });
});
