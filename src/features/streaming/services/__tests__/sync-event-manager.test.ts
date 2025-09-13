import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SyncEventManager } from "../sync-event-manager";
import type { PlaybackEvent } from "../../domain/stream.types";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue({ error: null }),
    unsubscribe: vi.fn().mockResolvedValue({ error: null }),
    send: vi.fn().mockResolvedValue({ error: null }),
  })),
};

describe("SyncEventManager", () => {
  let syncEventManager: SyncEventManager;
  let mockEvent: PlaybackEvent;

  beforeEach(() => {
    vi.clearAllMocks();
    syncEventManager = new SyncEventManager(
      "test-stream-id",
      mockSupabase as any
    );

    mockEvent = {
      type: "play",
      timestamp: Date.now(),
      time: 120,
      hostUserId: "host-123",
      eventId: "event-123",
      metadata: {},
    };
  });

  afterEach(() => {
    syncEventManager.destroy();
  });

  describe("Event Broadcasting", () => {
    it("should broadcast event successfully", async () => {
      const result = await syncEventManager.broadcastEvent(mockEvent);

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("playback_events");
    });

    it("should handle broadcast failures gracefully", async () => {
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      });

      const result = await syncEventManager.broadcastEvent(mockEvent);

      expect(result).toBe(false);
    });
  });

  describe("Event Deduplication", () => {
    it("should detect duplicate events", async () => {
      await syncEventManager.broadcastEvent(mockEvent);

      const isDuplicate = syncEventManager.isDuplicateEvent(mockEvent);

      expect(isDuplicate).toBe(true);
    });

    it("should not detect unique events as duplicates", () => {
      const uniqueEvent = { ...mockEvent, eventId: "unique-event-456" };

      const isDuplicate = syncEventManager.isDuplicateEvent(uniqueEvent);

      expect(isDuplicate).toBe(false);
    });

    it("should mark events as processed", () => {
      syncEventManager.markEventProcessed("test-event-id");

      const testEvent = { ...mockEvent, eventId: "test-event-id" };
      const isDuplicate = syncEventManager.isDuplicateEvent(testEvent);

      expect(isDuplicate).toBe(true);
    });
  });

  describe("Rate Limiting", () => {
    it("should allow events within rate limit", () => {
      const canBroadcast = syncEventManager.canBroadcastEvent();

      expect(canBroadcast).toBe(true);
    });

    it("should prevent events when rate limit exceeded", async () => {
      // Simulate rapid events to exceed rate limit
      for (let i = 0; i < 10; i++) {
        await syncEventManager.broadcastEvent({
          ...mockEvent,
          eventId: `event-${i}`,
        });
      }

      const canBroadcast = syncEventManager.canBroadcastEvent();

      expect(canBroadcast).toBe(false);
    });

    it("should return remaining rate limit count", () => {
      const remaining = syncEventManager.getRemainingRateLimit();

      expect(typeof remaining).toBe("number");
      expect(remaining).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Event Queue Management", () => {
    it("should queue events when offline", () => {
      syncEventManager.queueEvent(mockEvent);

      // Queue should contain the event (we'll verify this through processing)
      expect(() => syncEventManager.processEventQueue()).not.toThrow();
    });

    it("should process queued events", async () => {
      syncEventManager.queueEvent(mockEvent);

      await syncEventManager.processEventQueue();

      // Verify the event was processed by checking if it's now marked as duplicate
      expect(syncEventManager.isDuplicateEvent(mockEvent)).toBe(true);
    });

    it("should clear event queue", () => {
      syncEventManager.queueEvent(mockEvent);
      syncEventManager.clearEventQueue();

      // After clearing, processing should not affect the event
      syncEventManager.processEventQueue();
      expect(syncEventManager.isDuplicateEvent(mockEvent)).toBe(false);
    });
  });

  describe("Event Processing", () => {
    it("should process incoming events", async () => {
      const onEventCallback = vi.fn();
      syncEventManager.onEvent(onEventCallback);

      await syncEventManager.processIncomingEvent(mockEvent);

      expect(onEventCallback).toHaveBeenCalledWith(mockEvent);
    });

    it("should ignore duplicate incoming events", async () => {
      const onEventCallback = vi.fn();
      syncEventManager.onEvent(onEventCallback);

      // Mark event as already processed
      syncEventManager.markEventProcessed(mockEvent.eventId);

      await syncEventManager.processIncomingEvent(mockEvent);

      expect(onEventCallback).not.toHaveBeenCalled();
    });
  });

  describe("Chronological Ordering", () => {
    it("should process events in chronological order when batched", async () => {
      const onEventCallback = vi.fn();
      syncEventManager.onEvent(onEventCallback);

      const event1 = { ...mockEvent, eventId: "event-1", timestamp: 1000 };
      const event2 = { ...mockEvent, eventId: "event-2", timestamp: 2000 };
      const event3 = { ...mockEvent, eventId: "event-3", timestamp: 1500 };

      // Add events to batch processing
      syncEventManager.addEventToBatch(event2);
      syncEventManager.addEventToBatch(event1);
      syncEventManager.addEventToBatch(event3);

      // Process the batch
      await syncEventManager.processBatch();

      // Should be called in chronological order: event1, event3, event2
      expect(onEventCallback).toHaveBeenNthCalledWith(1, event1);
      expect(onEventCallback).toHaveBeenNthCalledWith(2, event3);
      expect(onEventCallback).toHaveBeenNthCalledWith(3, event2);
    });
  });
});
