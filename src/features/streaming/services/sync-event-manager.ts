import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlaybackEvent } from "../domain/stream.types";

export class SyncEventManager {
  private streamId: string;
  private supabase: SupabaseClient;
  private processedEvents = new Set<string>();
  private eventQueue: PlaybackEvent[] = [];
  private eventCallbacks: ((event: PlaybackEvent) => void)[] = [];
  private rateLimitWindow = new Map<number, number>();
  private readonly maxEventsPerSecond = 5;
  private eventBuffer: PlaybackEvent[] = [];

  constructor(streamId: string, supabase: SupabaseClient) {
    this.streamId = streamId;
    this.supabase = supabase;
  }

  async broadcastEvent(event: PlaybackEvent): Promise<boolean> {
    try {
      // Check rate limit
      if (!this.canBroadcastEvent()) {
        return false;
      }

      // Update rate limit tracking
      this.updateRateLimit();

      // Mark as processed to avoid duplicates (even if broadcast fails)
      this.markEventProcessed(event.eventId);

      // Insert event into database
      const { error } = await this.supabase.from("playback_events").insert({
        stream_id: this.streamId,
        host_user_id: event.hostUserId,
        event_type: event.type,
        event_id: event.eventId,
        timestamp_ms: event.timestamp,
        current_time: event.currentTime,
        metadata: event.metadata || {},
      });

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async processIncomingEvent(event: PlaybackEvent): Promise<void> {
    // Check for duplicates
    if (this.isDuplicateEvent(event)) {
      return;
    }

    // Mark as processed
    this.markEventProcessed(event.eventId);

    // Add to buffer for chronological processing
    this.eventBuffer.push(event);
    this.eventBuffer.sort((a, b) => a.timestamp - b.timestamp);

    // Process all buffered events in chronological order
    const eventsToProcess = [...this.eventBuffer];
    this.eventBuffer = [];

    for (const eventToProcess of eventsToProcess) {
      this.eventCallbacks.forEach((callback) => callback(eventToProcess));
    }
  }

  queueEvent(event: PlaybackEvent): void {
    this.eventQueue.push(event);
  }

  async processEventQueue(): Promise<void> {
    const events = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of events) {
      await this.broadcastEvent(event);
    }
  }

  clearEventQueue(): void {
    this.eventQueue = [];
  }

  isDuplicateEvent(event: PlaybackEvent): boolean {
    return this.processedEvents.has(event.eventId);
  }

  markEventProcessed(eventId: string): void {
    this.processedEvents.add(eventId);
  }

  canBroadcastEvent(): boolean {
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentCount = this.rateLimitWindow.get(currentSecond) || 0;
    return currentCount < this.maxEventsPerSecond;
  }

  getRemainingRateLimit(): number {
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentCount = this.rateLimitWindow.get(currentSecond) || 0;
    return Math.max(0, this.maxEventsPerSecond - currentCount);
  }

  onEvent(callback: (event: PlaybackEvent) => void): void {
    this.eventCallbacks.push(callback);
  }

  addEventToBatch(event: PlaybackEvent): void {
    if (!this.isDuplicateEvent(event)) {
      this.markEventProcessed(event.eventId);
      this.eventBuffer.push(event);
    }
  }

  async processBatch(): Promise<void> {
    // Sort events chronologically
    this.eventBuffer.sort((a, b) => a.timestamp - b.timestamp);

    // Process all events in order
    for (const event of this.eventBuffer) {
      this.eventCallbacks.forEach((callback) => callback(event));
    }

    // Clear the batch
    this.eventBuffer = [];
  }

  destroy(): void {
    this.processedEvents.clear();
    this.eventQueue = [];
    this.eventCallbacks = [];
    this.rateLimitWindow.clear();
    this.eventBuffer = [];
  }

  private updateRateLimit(): void {
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentCount = this.rateLimitWindow.get(currentSecond) || 0;
    this.rateLimitWindow.set(currentSecond, currentCount + 1);

    // Clean up old entries (keep only last 2 seconds)
    const cutoff = currentSecond - 2;
    for (const [timestamp] of this.rateLimitWindow) {
      if (timestamp < cutoff) {
        this.rateLimitWindow.delete(timestamp);
      }
    }
  }
}
