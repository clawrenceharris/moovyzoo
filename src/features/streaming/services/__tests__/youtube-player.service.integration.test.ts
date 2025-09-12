import { describe, it, expect } from "vitest";
import {
  YouTubePlayerService,
  YT_PLAYER_STATE,
} from "../youtube-player.service";
import type { YouTubePlayer } from "../../domain/stream.types";

describe("YouTubePlayerService Integration", () => {
  it("should be importable from the services index", async () => {
    const {
      YouTubePlayerService: ImportedService,
      YT_PLAYER_STATE: ImportedStates,
    } = await import("../index");
    expect(ImportedService).toBeDefined();
    expect(ImportedStates).toBeDefined();
    expect(ImportedStates.PLAYING).toBe(1);
    expect(ImportedStates.PAUSED).toBe(2);
  });

  it("should be exportable through the services module", () => {
    // Test that the service can be instantiated and used
    const mockPlayerRef = { current: null } as React.RefObject<YouTubePlayer>;
    const service = new YouTubePlayerService(mockPlayerRef);
    expect(service).toBeInstanceOf(YouTubePlayerService);
    expect(service.isPlayerReady()).toBe(false);
  });

  it("should create service instance with proper interface", () => {
    const mockPlayerRef = { current: null };
    const service = new YouTubePlayerService(mockPlayerRef);

    // Verify all required methods exist
    expect(typeof service.play).toBe("function");
    expect(typeof service.pause).toBe("function");
    expect(typeof service.seekTo).toBe("function");
    expect(typeof service.getCurrentTime).toBe("function");
    expect(typeof service.getPlayerState).toBe("function");
    expect(typeof service.getDuration).toBe("function");
    expect(typeof service.onStateChange).toBe("function");
    expect(typeof service.onReady).toBe("function");
    expect(typeof service.onError).toBe("function");
    expect(typeof service.syncToState).toBe("function");
    expect(typeof service.getDetailedState).toBe("function");
    expect(typeof service.reload).toBe("function");
    expect(typeof service.isPlayerReady).toBe("function");
  });

  it("should have correct YouTube player state constants", () => {
    expect(YT_PLAYER_STATE.UNSTARTED).toBe(-1);
    expect(YT_PLAYER_STATE.ENDED).toBe(0);
    expect(YT_PLAYER_STATE.PLAYING).toBe(1);
    expect(YT_PLAYER_STATE.PAUSED).toBe(2);
    expect(YT_PLAYER_STATE.BUFFERING).toBe(3);
    expect(YT_PLAYER_STATE.CUED).toBe(5);
  });
});
