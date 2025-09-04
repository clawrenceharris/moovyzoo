import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBaseRealtime } from "../use-base-realtime";
import { supabase } from "@/utils/supabase/client";
import { mockChannel } from "storybook/internal/preview-api";
import { mockChannel } from "storybook/internal/preview-api";
import { mockChannel } from "storybook/internal/preview-api";
import { mockChannel } from "storybook/internal/preview-api";
import { mockChannel } from "storybook/internal/preview-api";
import { mockChannel } from "storybook/internal/preview-api";

// Mock Supabase client
vi.mock("@/utils/supabase/client", () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  };

  return {
    supabase: {
      channel: vi.fn(() => mockChannel),
      removeChannel: vi.fn(),
    },
  };
});

// Mock normalize error utility
vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn((error) => ({
    message: error?.message || "Unknown error",
  })),
}));

const mockSupabase = vi.mocked(supabase);

describe("useBaseRealtime", () => {
  const mockCallbacks = {
    onInsert: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onConnectionChange: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should create channel with correct name", () => {
    renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(mockSupabase.channel).toHaveBeenCalledWith("test-channel");
  });

  it("should set up postgres change listeners", () => {
    renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    const mockChannel = mockSupabase.channel.mock.results[0].value;
    expect(mockChannel.on).toHaveBeenCalledTimes(3);
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "test_table",
        filter: "id=eq.123",
      },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "test_table",
        filter: "id=eq.123",
      },
      expect.any(Function)
    );
    expect(mockChannel.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "test_table",
        filter: "id=eq.123",
      },
      expect.any(Function)
    );
  });

  it("should subscribe to channel", () => {
    renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(mockChannel.subscribe).toHaveBeenCalledWith(expect.any(Function));
  });

  it("should handle successful connection", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    // Simulate successful subscription
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
    act(() => {
      subscribeCallback("SUBSCRIBED");
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.connecting).toBe(false);
    expect(mockCallbacks.onConnectionChange).toHaveBeenCalledWith(true);
  });

  it("should handle connection errors", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    const error = new Error("Connection failed");
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];

    act(() => {
      subscribeCallback("CHANNEL_ERROR", error);
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
    expect(result.current.error).toBe("Connection failed");
    expect(mockCallbacks.onConnectionChange).toHaveBeenCalledWith(false);
    expect(mockCallbacks.onError).toHaveBeenCalledWith("Connection failed");
  });

  it("should attempt reconnection on failure", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
        options: {
          autoReconnect: true,
          reconnectDelay: 1000,
        },
      })
    );

    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];

    act(() => {
      subscribeCallback("CHANNEL_ERROR", new Error("Connection failed"));
    });

    expect(result.current.canReconnect).toBe(true);

    // Fast-forward time to trigger reconnection
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should attempt to create a new channel
    expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
  });

  it("should disconnect properly", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    act(() => {
      result.current.disconnect();
    });

    expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    expect(result.current.connected).toBe(false);
    expect(mockCallbacks.onConnectionChange).toHaveBeenCalledWith(false);
  });

  it("should manually reconnect", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    act(() => {
      result.current.reconnect();
    });

    // Should disconnect and create new channel
    expect(mockSupabase.removeChannel).toHaveBeenCalled();
    expect(mockSupabase.channel).toHaveBeenCalledTimes(2);
  });

  it("should clear errors", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    // Simulate error
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];
    act(() => {
      subscribeCallback("CHANNEL_ERROR", new Error("Test error"));
    });

    expect(result.current.error).toBe("Test error");

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it("should not connect when disabled", () => {
    renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
        enabled: false,
      })
    );

    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });
});
