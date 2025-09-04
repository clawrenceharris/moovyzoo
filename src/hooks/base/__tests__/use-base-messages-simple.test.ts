import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBaseMessages } from "../use-base-messages";

// Mock the normalize error utility
vi.mock("@/utils/normalize-error", () => ({
  normalizeError: vi.fn((error) => ({
    message: error?.message || "Unknown error",
  })),
}));

describe("useBaseMessages - Simple Tests", () => {
  const mockFetchMessages = vi.fn();
  const mockSendMessage = vi.fn();
  const mockDeleteMessage = vi.fn();

  const mockMessageService = {
    fetchMessages: mockFetchMessages,
    sendMessage: mockSendMessage,
    deleteMessage: mockDeleteMessage,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default state", () => {
    mockFetchMessages.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    // Initial state should show loading since fetch starts immediately
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.loadingMore).toBe(false);
    expect(result.current.sending).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(true);
  });

  it("should not fetch when resourceId is null", () => {
    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: null,
        userId: "user-1",
        messageService: mockMessageService,
      })
    );

    expect(mockFetchMessages).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });

  it("should not fetch when userId is null", () => {
    const { result } = renderHook(() =>
      useBaseMessages({
        resourceId: "test-id",
        userId: null,
        messageService: mockMessageService,
      })
    );

    expect(mockFetchMessages).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });
});
