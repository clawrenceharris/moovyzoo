import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBaseRealtime } from "../use-base-realtime";

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

describe("useBaseRealtime - Simple Tests", () => {
  const mockCallbacks = {
    onInsert: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onConnectionChange: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(true); // Should be connecting on mount
    expect(result.current.error).toBe(null);
  });

  it("should not connect when disabled", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
        enabled: false,
      })
    );

    expect(result.current.connected).toBe(false);
    expect(result.current.connecting).toBe(false);
  });

  it("should provide disconnect and reconnect functions", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(typeof result.current.disconnect).toBe("function");
    expect(typeof result.current.reconnect).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("should provide reconnection status", () => {
    const { result } = renderHook(() =>
      useBaseRealtime({
        channelName: "test-channel",
        tableName: "test_table",
        filter: "id=eq.123",
        callbacks: mockCallbacks,
      })
    );

    expect(typeof result.current.canReconnect).toBe("boolean");
    expect(typeof result.current.reconnectAttempts).toBe("number");
  });
});
