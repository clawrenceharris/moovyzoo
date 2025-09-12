import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SyncEventManager } from "../sync-event-manager";
import type { PlaybackEvent } from "../../domain/stream.types";

// Mock Supabase client with more realistic behavior
const createMockSupabase = () => ({
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
});

describe("SyncEventManager Integration", () => {
  let syncEventManager: SyncEventManager;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    syncEventManager = new SyncEventManager(
      "test-stream-id",
      mockSupabase as any
    );
  });

  afterEach(() => {
    syncEventManager.destroy();
  });

  describe("Real-world Sync Scenarios", () => {
    it("should handle rapid play/pause events with rate limiting", async () => {
      const events: PlaybackEvent[] = [];

      // Simulate rapid play/pause events
      for (let i = 0; i < 10; i++) {
        const event: PlaybackEvent = {
          type: i % 2 === 0 ? "play" : "pause",
          timestamp: Date.now() + i * 100,
          currentTime: i * 10,
          hostUserId: "host-123",
          eventId: `rapid-event-${i}`,
          metadata: {},
        };
        events.push(event);
      }

      // Try to broadcast all events
      const results = await Promise.all(
        events.map((event) => syncEventManager.broadcastEvent(event))
      );

      // Some should succeed, some should be rate limited
      const successCount = results.filter((result) => result).length;
      const failureCount = results.filter((result) => !result).length;

      expect(successCount).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(0);
      expect(successCount + failureCount).toBe(10);
    });

    it("should handle connection interruption and recovery", async () => {
      const event1: PlaybackEvent = {
        type: "play",
        timestamp: Date.now(),
        currentTime: 120,
        hostUserId: "host-123",
        eventId: "offline-event-1",
        metadata: {},
      };

      const event2: PlaybackEvent = {
        type: "pause",
        timestamp: Date.now() + 1000,
        currentTime: 125,
        hostUserId: "host-123",
        eventId: "offline-event-2",
        metadata: {},
      };

      // Simulate offline - queue events
      syncEventManager.queueEvent(event1);
      syncEventManager.queueEvent(event2);

      // Verify events are queued (not immediately broadcast)
      expect(mockSupabase.from).not.toHaveBeenCalled();

      // Simulate connection recovery - process queue
      await syncEventManager.processEventQueue();

      // Verify events were broadcast after recovery
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it("should maintain event ordering during high-frequency updates", async () => {
      const onEventCallback = vi.fn();
      syncEventManager.onEvent(onEventCallback);

      // Create events with timestamps that arrive out of order
      const baseTime = Date.now();
      const events = [
        { eventId: "event-5", timestamp: baseTime + 500 },
        { eventId: "event-1", timestamp: baseTime + 100 },
        { eventId: "event-3", timestamp: baseTime + 300 },
        { eventId: "event-2", timestamp: baseTime + 200 },
        { eventId: "event-4", timestamp: baseTime + 400 },
      ].map(({ eventId, timestamp }) => ({
        type: "seek" as const,
        timestamp,
        currentTime: 120,
        hostUserId: "host-123",
        eventId,
        metadata: { seekFrom: 100 },
      }));

      // Add events to batch in random order
      for (const event of events) {
        syncEventManager.addEventToBatch(event);
      }

      // Process batch
      await syncEventManager.processBatch();

      // Verify events were processed in chronological order
      expect(onEventCallback).toHaveBeenCalledTimes(5);
      expect(onEventCallback).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ eventId: "event-1" })
      );
      expect(onEventCallback).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ eventId: "event-2" })
      );
      expect(onEventCallback).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ eventId: "event-3" })
      );
      expect(onEventCallback).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({ eventId: "event-4" })
      );
      expect(onEventCallback).toHaveBeenNthCalledWith(
        5,
        expect.objectContaining({ eventId: "event-5" })
      );
    });

    it("should handle database errors gracefully", async () => {
      // Simulate database error
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection timeout" },
        }),
      });

      const event: PlaybackEvent = {
        type: "play",
        timestamp: Date.now(),
        currentTime: 120,
        hostUserId: "host-123",
        eventId: "error-event",
        metadata: {},
      };

      const result = await syncEventManager.broadcastEvent(event);

      expect(result).toBe(false);
      // Event should still be marked as processed to avoid retries
      expect(syncEventManager.isDuplicateEvent(event)).toBe(true);
    });

    it("should prevent duplicate event processing across different methods", async () => {
      const onEventCallback = vi.fn();
      syncEventManager.onEvent(onEventCallback);

      const event: PlaybackEvent = {
        type: "play",
        timestamp: Date.now(),
        currentTime: 120,
        hostUserId: "host-123",
        eventId: "duplicate-test",
        metadata: {},
      };

      // Broadcast event first
      await syncEventManager.broadcastEvent(event);

      // Try to process the same event as incoming
      await syncEventManager.processIncomingEvent(event);

      // Try to add to batch
      syncEventManager.addEventToBatch(event);
      await syncEventManager.processBatch();

      // Should only be processed once (during broadcast)
      expect(onEventCallback).not.toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe("Performance and Memory Management", () => {
    it("should clean up processed events to prevent memory leaks", async () => {
      // Process many events
      for (let i = 0; i < 1000; i++) {
        const event: PlaybackEvent = {
          type: "seek",
          timestamp: Date.now() + i,
          currentTime: i,
          hostUserId: "host-123",
          eventId: `perf-event-${i}`,
          metadata: {},
        };

        syncEventManager.markEventProcessed(event.eventId);
      }

      // Verify events are tracked
      expect(
        syncEventManager.isDuplicateEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 500,
          hostUserId: "host-123",
          eventId: "perf-event-500",
          metadata: {},
        })
      ).toBe(true);

      // Cleanup should be handled by destroy
      syncEventManager.destroy();

      // Create new instance to verify cleanup
      const newManager = new SyncEventManager(
        "test-stream-id",
        mockSupabase as any
      );

      expect(
        newManager.isDuplicateEvent({
          type: "seek",
          timestamp: Date.now(),
          currentTime: 500,
          hostUserId: "host-123",
          eventId: "perf-event-500",
          metadata: {},
        })
      ).toBe(false);

      newManager.destroy();
    });
  });
});
