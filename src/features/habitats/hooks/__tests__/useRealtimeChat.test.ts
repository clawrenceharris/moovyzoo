import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRealtimeChat } from "../useRealtimeChat";

// Mock the base hook
vi.mock("@/hooks/base/use-base-realtime", () => ({
  useBaseRealtime: vi.fn(),
}));

// Mock Supabase client for profile fetching
vi.mock("@/utils/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

import { useBaseRealtime } from "@/hooks/base/use-base-realtime";

const mockUseBaseRealtime = vi.mocked(useBaseRealtime);

describe("useRealtimeChat", () => {
  const mockBaseReturn = {
    connected: false,
    connecting: false,
    error: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    reconnect: vi.fn(),
    clearError: vi.fn(),
    canReconnect: true,
    reconnectAttempts: 0,
  };

  const mockCallbacks = {
    onMessageInsert: vi.fn(),
    onMessageUpdate: vi.fn(),
    onMessageDelete: vi.fn(),
    onConnectionChange: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBaseRealtime.mockReturnValue(mockBaseReturn);
  });

  it("should call useBaseRealtime with correct parameters", () => {
    renderHook(() => useRealtimeChat("habitat-1", "user-1", mockCallbacks));

    expect(mockUseBaseRealtime).toHaveBeenCalledWith({
      channelName: "habitat:habitat-1",
      tableName: "habitat_messages",
      filter: "habitat_id=eq.habitat-1",
      callbacks: {
        onInsert: expect.any(Function),
        onUpdate: expect.any(Function),
        onDelete: expect.any(Function),
        onConnectionChange: mockCallbacks.onConnectionChange,
        onError: mockCallbacks.onError,
      },
      enabled: true,
      options: {
        autoReconnect: true,
        reconnectDelay: 3000,
        maxReconnectAttempts: 5,
      },
    });
  });

  it("should return all base hook functionality", () => {
    const { result } = renderHook(() =>
      useRealtimeChat("habitat-1", "user-1", mockCallbacks)
    );

    expect(result.current).toEqual(mockBaseReturn);
  });

  it("should handle null habitatId", () => {
    renderHook(() => useRealtimeChat(null, "user-1", mockCallbacks));

    expect(mockUseBaseRealtime).toHaveBeenCalledWith({
      channelName: "habitat:null",
      tableName: "habitat_messages",
      filter: "habitat_id=eq.null",
      callbacks: expect.any(Object),
      enabled: false, // Should be disabled when habitatId is null
      options: expect.any(Object),
    });
  });

  it("should handle null userId", () => {
    renderHook(() => useRealtimeChat("habitat-1", null, mockCallbacks));

    expect(mockUseBaseRealtime).toHaveBeenCalledWith({
      channelName: "habitat:habitat-1",
      tableName: "habitat_messages",
      filter: "habitat_id=eq.habitat-1",
      callbacks: expect.any(Object),
      enabled: false, // Should be disabled when userId is null
      options: expect.any(Object),
    });
  });

  it("should pass through options", () => {
    const customOptions = {
      autoReconnect: false,
      reconnectDelay: 5000,
      maxReconnectAttempts: 3,
    };

    renderHook(() =>
      useRealtimeChat("habitat-1", "user-1", mockCallbacks, customOptions)
    );

    expect(mockUseBaseRealtime).toHaveBeenCalledWith({
      channelName: "habitat:habitat-1",
      tableName: "habitat_messages",
      filter: "habitat_id=eq.habitat-1",
      callbacks: expect.any(Object),
      enabled: true,
      options: customOptions,
    });
  });
});
